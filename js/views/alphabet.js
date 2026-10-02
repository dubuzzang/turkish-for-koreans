// 0단원: 알파벳·발음 — 글자표, 한국인이 헷갈리는 소리(최소대립쌍), 발음 규칙
import { h, icon, speakBtn, hangulEl, openSheet } from '../core/ui.js';
import { state, commit } from '../core/store.js';
import { LETTERS, PAIRS, SOUND_RULES } from '../data/alphabet.js';

function openLetter(L, onSeen) {
  if (!state.letters[L.up]) { state.letters[L.up] = Date.now(); commit(); onSeen?.(); }
  openSheet({
    title: '',
    label: `${L.up} ${L.lo}`,
    body: h('div', { class: 'col', style: { gap: '14px' } },
      h('div', { class: 'row', style: { alignItems: 'center' } },
        h('div', { style: { fontSize: '64px', fontWeight: 850, lineHeight: 1, letterSpacing: '-.02em', color: L.special ? 'var(--accent)' : 'var(--text)' } }, `${L.up}${L.lo}`),
        h('div', { class: 'grow' },
          h('div', { class: 'small muted bold' }, '글자 이름'),
          h('div', { class: 'bold', style: { fontSize: '20px' } }, L.say),
          h('div', { class: 'small text-2' }, `소리: ${L.ko} · [${L.ipa}]`),
        ),
        speakBtn(L.say),
      ),
      h('div', { class: `note ${L.special ? 'warn' : 'ko'}` }, h('div', { class: 'note-title' }, icon('bulb', 14), L.special ? '한국인 주의 포인트' : '발음 팁'), L.tip),
      h('div', { class: 'bold' }, '예시 단어'),
      h('div', { class: 'ex-list' }, L.ex.map(([tr, ko]) => h('div', { class: 'ex-line' },
        speakBtn(tr, { size: 'sm' }),
        h('div', { class: 'grow' }, h('div', { class: 'ex-tr' }, tr), hangulEl(tr, 'hangul tiny'), h('div', { class: 'ex-ko' }, ko)),
        speakBtn(tr, { size: 'sm', slow: true }),
      ))),
    ),
  });
}

function lettersTab(box) {
  const grid = h('div', { class: 'letter-grid' });
  const progress = h('div', { class: 'small muted' });
  const render = () => {
    progress.textContent = `확인한 글자 ${Object.keys(state.letters).length} / ${LETTERS.length} — 눌러서 소리를 들어 보세요`;
    grid.replaceChildren(...LETTERS.map((L) => {
      const b = h('button', { class: `letter-cell ${L.special ? 'special' : ''} ${state.letters[L.up] ? 'seen' : ''}`, type: 'button', 'aria-label': `${L.up} 글자 자세히` },
        h('div', { class: 'lc-big' }, `${L.up}${L.lo}`),
        h('div', { class: 'lc-ko' }, L.ko),
      );
      b.addEventListener('click', () => openLetter(L, render));
      return b;
    }));
  };
  render();
  box.replaceChildren(
    h('div', { class: 'card' },
      h('div', { class: 'bold', style: { fontSize: '17px' } }, '쓰는 대로 읽는 문자예요'),
      h('p', { class: 'small text-2 mt-4' }, '튀르키예어는 1928년에 만든 라틴 문자 29자를 써요. 한 글자가 한 소리 — 한글처럼 철자만 알면 바로 읽을 수 있어요. 빨간 글자는 한국인이 특히 주의할 소리예요.'),
      h('div', { class: 'note ko mt-12' }, h('div', { class: 'note-title' }, '😉 한국인에게 유리한 점'), h('b', null, 'ı = 으, ö = 외, ü = 위'), ' — 영어권 사람들이 가장 어려워하는 세 모음이 한국어엔 이미 있어요!'),
    ),
    h('div', { class: 'mt-16' }, progress),
    h('div', { class: 'mt-8' }, grid),
    h('a', { class: 'btn btn-soft btn-block btn-lg mt-16', href: '#/drill/pairs' }, icon('headphones', 20), '헷갈리는 소리 듣기 퀴즈'),
  );
}

function pairsTab(box) {
  box.replaceChildren(
    h('p', { class: 'text-2', style: { margin: '0 2px 12px' } }, '한국어에 없는 구분이라 귀가 쉽게 속는 소리들이에요. 양쪽을 번갈아 들으며 차이를 느껴 보세요.'),
    ...PAIRS.map((g) => h('div', { class: 'card' },
      h('div', { class: 'row between' }, h('h3', null, g.title)),
      h('p', { class: 'small text-2 mt-4' }, g.desc),
      h('div', { class: 'col mt-12' }, g.pairs.map(([a, aKo, b, bKo]) => h('div', { class: 'pair-card' },
        h('div', { class: 'pair-side' }, h('div', { class: 'p-tr' }, a), h('div', { class: 'p-ko' }, aKo), speakBtn(a, { size: 'sm' })),
        h('div', { class: 'pair-vs' }, 'vs'),
        h('div', { class: 'pair-side' }, h('div', { class: 'p-tr' }, b), h('div', { class: 'p-ko' }, bKo), speakBtn(b, { size: 'sm' })),
      ))),
    )),
    h('a', { class: 'btn btn-primary btn-block btn-lg mt-16', href: '#/drill/pairs' }, icon('headphones', 20), '듣고 구분하기 퀴즈'),
  );
}

function rulesTab(box) {
  box.replaceChildren(
    ...SOUND_RULES.map((r) => h('div', { class: 'card' }, h('h3', null, r.title), h('p', { class: 'small text-2 mt-4', html: r.body }))),
    h('div', { class: 'card' },
      h('h3', null, '한글 발음 표기에 대해'),
      h('p', { class: 'small text-2 mt-4' }, '처음엔 [메르하바]처럼 한글 표기가 도움이 되지만, f·v·z·ş 같은 소리는 한글로 정확히 쓸 수 없어요. 알파벳에 익숙해지면 설정에서 한글 표기를 끄고 소리로만 익혀 보세요.'),
      h('a', { class: 'btn btn-soft btn-sm mt-12', href: '#/settings' }, '설정 열기'),
    ),
  );
}

export default {
  tab: 'learn',
  title: '발음과 알파벳',
  render(root) {
    let tab = 'letters';
    const box = h('div', { class: 'mt-16' });
    const seg = h('div', { class: 'seg', role: 'tablist' });
    const renderTab = () => {
      seg.replaceChildren(...[['letters', '글자 29자'], ['pairs', '헷갈리는 소리'], ['rules', '발음 규칙']].map(([k, label]) =>
        h('button', { class: tab === k ? 'on' : '', role: 'tab', 'aria-selected': String(tab === k), onclick: () => { tab = k; renderTab(); } }, label)));
      ({ letters: lettersTab, pairs: pairsTab, rules: rulesTab })[tab](box);
    };
    root.append(
      h('div', { class: 'page-head' }, h('a', { class: 'small', href: '#/learn' }, '← 학습 경로'), h('h1', { class: 'mt-4' }, '발음과 알파벳'), h('p', null, '첫 단원 전에 10분만 투자하세요. 읽기가 훨씬 쉬워져요.')),
      seg,
      box,
    );
    renderTab();
  },
};
