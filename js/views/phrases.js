// 생존 표현집
import { h, icon, speakBtn, hangulEl } from '../core/ui.js';
import { normalize, fold } from '../core/tr.js';
import { PHRASE_CATS, ALL_PHRASES } from '../data/phrases.js';

const key = (s) => fold(normalize(s));

export default {
  tab: 'learn',
  title: '생존 표현집',
  render(root) {
    let cat = 'all';
    let q = '';
    const input = h('input', { type: 'search', placeholder: '튀르키예어·한국어 검색 (예: 화장실)', 'aria-label': '표현 검색', autocomplete: 'off' });
    const chips = h('div', { class: 'chips-scroll' });
    const list = h('div', { class: 'col mt-12', style: { gap: '10px' } });
    const renderChips = () => chips.replaceChildren(
      h('button', { class: `chip ${cat === 'all' ? 'active' : ''}`, onclick: () => { cat = 'all'; renderChips(); renderList(); } }, '전체'),
      ...PHRASE_CATS.map((c) => h('button', { class: `chip ${cat === c.id ? 'active' : ''}`, onclick: () => { cat = c.id; renderChips(); renderList(); } }, `${c.emoji} ${c.title}`)),
    );
    const renderList = () => {
      const kq = key(q);
      const items = ALL_PHRASES.filter((p) => (cat === 'all' || p.cat === cat) && (!kq || key(p.tr).includes(kq) || p.ko.includes(q.trim())));
      list.replaceChildren(...items.map((p) => {
        const say = p.tr.replace(/…/g, '').replace(/\s*\/\s*/g, ', ');
        return h('div', { class: 'ex-line', style: { background: 'var(--surface)', boxShadow: 'var(--shadow-1)' } },
          speakBtn(say, { size: 'sm' }),
          h('div', { class: 'grow' },
            h('div', { class: 'ex-tr', style: { fontSize: '17px' } }, p.tr),
            hangulEl(say, 'hangul tiny'),
            h('div', { class: 'ex-ko' }, p.ko),
            p.note ? h('div', { class: 'ex-gloss' }, `💡 ${p.note}`) : null,
          ),
          speakBtn(say, { size: 'sm', slow: true }),
        );
      }));
      if (!items.length) list.replaceChildren(h('div', { class: 'empty' }, h('div', { class: 'e-emoji' }, '🔍'), '찾는 표현이 없어요'));
    };
    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { q = input.value; renderList(); }, 120); });
    root.append(
      h('div', { class: 'page-head' },
        h('a', { class: 'small', href: '#/talk' }, '← 상황별 회화'),
        h('h1', { class: 'mt-4' }, '생존 표현집'),
        h('p', null, `여행과 생활에서 바로 쓰는 문장 ${ALL_PHRASES.length}개. 🔊 듣기 · 🐢 천천히 듣기`),
      ),
      h('div', { class: 'search' }, icon('search', 20), input),
      h('div', { class: 'mt-12' }, chips),
      list,
    );
    renderChips();
    renderList();
  },
};
