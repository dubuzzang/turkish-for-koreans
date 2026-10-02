// 단어장: 검색 · 주제별 보기 · 상세(예문·메모·복습 상태)
import { h, icon, speakBtn, hangulEl, openSheet, toast, POS_LABEL, setKids } from '../core/ui.js';
import { state } from '../core/store.js';
import { wordStatus, learnWords, removeWord, isLearned } from '../core/deck.js';
import { normalize, fold } from '../core/tr.js';
import { toHangul } from '../core/hangul.js';
import { WORDS, CATS, catOf } from '../data/vocab.js';

const STATUS_LABEL = { none: '미학습', new: '새 카드', learning: '익히는 중', young: '복습 중', mature: '장기 기억' };
const DOT = { none: '', new: 'learning', learning: 'learning', young: 'young', mature: 'mature' };

let detailExtras = [];
/** 상세 시트에 섹션을 덧붙이는 확장 지점 (예: 활용표) */
export const addWordDetail = (fn) => detailExtras.push(fn);

export function openWordSheet(w, onChange) {
  const body = h('div', { class: 'col', style: { gap: '14px' } });
  const render = () => {
    const st = wordStatus(w.id);
    const learned = isLearned(w.id);
    setKids(body,
      h('div', { class: 'row', style: { alignItems: 'flex-start' } },
        h('div', { class: 'grow' },
          h('div', { class: 'word-xl' }, w.tr),
          hangulEl(w.tr),
        ),
        speakBtn(w.tr), speakBtn(w.tr, { slow: true }),
      ),
      h('div', null,
        h('div', { class: 'meaning' }, w.ko),
        h('div', { class: 'row wrap mt-8', style: { gap: '6px' } },
          h('span', { class: 'badge' }, POS_LABEL[w.pos] || w.pos),
          h('span', { class: 'badge' }, `${catOf(w.cat)?.emoji || ''} ${catOf(w.cat)?.ko || ''}`),
          h('span', { class: `badge ${st === 'mature' ? 'ok' : st === 'none' ? '' : 'brand'}` }, STATUS_LABEL[st]),
        ),
      ),
      w.ex ? h('div', { class: 'example' }, speakBtn(w.ex[0], { size: 'sm' }), h('div', { class: 'grow' }, h('div', { class: 'ex-tr' }, w.ex[0]), hangulEl(w.ex[0], 'hangul tiny'), h('div', { class: 'ex-ko' }, w.ex[1]))) : null,
      w.note ? h('div', { class: 'note ko' }, h('div', { class: 'note-title' }, icon('bulb', 14), '포인트'), w.note) : null,
      ...detailExtras.map((fn) => fn(w)).filter(Boolean),
      learned
        ? h('button', { class: 'btn btn-outline btn-block', onclick: () => { removeWord(w.id); toast('복습 덱에서 뺐어요'); render(); onChange?.(); } }, icon('trash', 18), '복습 덱에서 빼기')
        : h('button', { class: 'btn btn-primary btn-block', onclick: () => { learnWords([w.id], { [w.id]: 1 }); toast('복습 덱에 넣었어요 — 곧 복습에 나와요', 'ok'); render(); onChange?.(); } }, icon('plus', 18), '복습 덱에 넣기'),
    );
  };
  render();
  openSheet({ title: '', body, label: w.tr });
}

const keyOf = (s) => fold(normalize(s));

export default {
  tab: 'words',
  title: '단어장',
  render(root) {
    let q = '';
    let cat = 'all';
    let filter = 'all';
    let limit = 120;
    const input = h('input', { type: 'search', placeholder: '튀르키예어 또는 한국어로 검색', 'aria-label': '단어 검색', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const chips = h('div', { class: 'chips-scroll' });
    const seg = h('div', { class: 'seg' });
    const countEl = h('div', { class: 'small muted' });
    const list = h('div', { class: 'list mt-12' });
    const more = h('button', { class: 'btn btn-soft btn-block mt-12' }, '더 보기');

    const renderChips = () => {
      chips.replaceChildren(
        h('button', { class: `chip ${cat === 'all' ? 'active' : ''}`, onclick: () => { cat = 'all'; limit = 120; renderChips(); renderList(); } }, '전체'),
        ...CATS.map((c) => h('button', { class: `chip ${cat === c.id ? 'active' : ''}`, onclick: () => { cat = c.id; limit = 120; renderChips(); renderList(); } }, `${c.emoji} ${c.ko}`)),
      );
    };
    const renderSeg = () => {
      seg.replaceChildren(...[['all', '전체'], ['learned', '학습함'], ['new', '미학습']].map(([k, label]) =>
        h('button', { class: filter === k ? 'on' : '', onclick: () => { filter = k; limit = 120; renderSeg(); renderList(); } }, label)));
    };
    const renderList = () => {
      const kq = keyOf(q);
      const res = WORDS.filter((w) => {
        if (cat !== 'all' && w.cat !== cat) return false;
        if (filter === 'learned' && !isLearned(w.id)) return false;
        if (filter === 'new' && isLearned(w.id)) return false;
        if (!kq) return true;
        return keyOf(w.tr).includes(kq) || w.ko.includes(q.trim()) || (w.alt || []).some((a) => keyOf(a).includes(kq));
      });
      countEl.textContent = `${res.length}개 단어`;
      list.replaceChildren(...res.slice(0, limit).map((w) => {
        const st = wordStatus(w.id);
        const row = h('button', { class: 'word-row', type: 'button' },
          h('span', { class: `srs-dot ${DOT[st]}`, title: STATUS_LABEL[st] }),
          h('div', { class: 'w-main' },
            h('div', null, h('span', { class: 'w-tr' }, w.tr), state.settings.hangul ? h('span', { class: 'w-hg' }, toHangul(w.tr)) : null),
            h('div', { class: 'w-ko' }, w.ko),
          ),
          speakBtn(w.tr, { size: 'sm' }),
        );
        row.addEventListener('click', () => openWordSheet(w, renderList));
        return row;
      }));
      if (!res.length) list.replaceChildren(h('div', { class: 'empty' }, h('div', { class: 'e-emoji' }, '🔍'), '검색 결과가 없어요'));
      more.hidden = res.length <= limit;
    };
    more.addEventListener('click', () => { limit += 200; renderList(); });
    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { q = input.value; limit = 120; renderList(); }, 120); });

    root.append(
      h('div', { class: 'page-head' }, h('h1', null, '단어장'), h('p', null, `예문이 있는 핵심 단어 ${WORDS.length}개. 눌러서 자세히 보고, 복습 덱에 넣을 수 있어요.`)),
      h('div', { class: 'search' }, icon('search', 20), input),
      h('div', { class: 'mt-12' }, chips),
      h('div', { class: 'row between mt-8' }, seg, countEl),
      list,
      more,
    );
    renderChips();
    renderSeg();
    renderList();
  },
};
