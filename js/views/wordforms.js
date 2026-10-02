// 단어 상세의 활용표: 명사 격변화·소유형, 형용사 "~이다", 동사 시제별 활용
import { h, speakBtn } from '../core/ui.js';
import { canSpeak } from '../core/tts.js';
import { noun, copula, conjugate, TENSES, PERSONS, PERSON_KO, POSS_KO, personsFor } from '../core/morph.js';
import { headKo, CASE_GLOSS } from '../core/ko.js';
import { partsHTML } from '../core/drillgen.js';
import { addWordDetail } from './words.js';

const CASE_ROWS = [
  ['pl', '복수', { pl: true }],
  ['acc', '목적격', { cas: 'acc' }],
  ['dat', '여격', { cas: 'dat' }],
  ['loc', '장소격', { cas: 'loc' }],
  ['abl', '탈격', { cas: 'abl' }],
  ['gen', '속격', { cas: 'gen' }],
  ['ins', '도구격', { cas: 'ins' }],
];

function formsGrid(rows) {
  return h('div', { class: 'forms' }, rows.flatMap(([k, parts, ko]) => {
    const text = parts.map((p) => p.t).join('');
    return [
      h('div', { class: 'f-k' }, k),
      // 활용형은 대부분 녹음이 없어서, 기기 튀르키예어 음성이 있을 때만 듣기 버튼을 둔다
      h('div', { class: 'f-v' }, h('span', { html: partsHTML(parts), style: { marginRight: '6px' } }), canSpeak(text) ? speakBtn(text, { size: 'sm' }) : null),
      h('div', { class: 'f-ko' }, ko),
    ];
  }));
}

function details(title, body, open = false) {
  const d = h('details', { class: 'card flat', style: { padding: '12px 14px' } },
    h('summary', { class: 'bold', style: { cursor: 'pointer' } }, title),
    h('div', { class: 'mt-12' }, body),
  );
  if (open) d.open = true;
  return d;
}

const isSimpleNoun = (w) => w.pos === 'n' && !w.nodrill && !/\s/.test(w.tr);

addWordDetail((w) => {
  if (!isSimpleNoun(w)) return null;
  const k = headKo(w.ko);
  const rows = CASE_ROWS.map(([key, name, opts]) => {
    const f = noun(w, opts);
    return [name, f.parts, key === 'pl' ? `${k}들` : CASE_GLOSS[key](k)];
  });
  return details('📐 격변화 (조사 붙이기)', formsGrid(rows));
});

addWordDetail((w) => {
  if (!isSimpleNoun(w) || w.proper) return null;
  const k = headKo(w.ko);
  const rows = [1, 2, 3, 4, 5, 6].map((p) => [POSS_KO[p], noun(w, { poss: p }).parts, `${POSS_KO[p]} ${k}`]);
  return details('👜 소유형 (내 ~, 네 ~ …)', formsGrid(rows));
});

addWordDetail((w) => {
  if (!['adj'].includes(w.pos) || w.nodrill || /\s/.test(w.tr)) return null;
  const rows = [1, 2, 3, 4, 5, 6].map((p) => [PERSONS[p], copula(w, p).parts, `${PERSON_KO[p]} · ${headKo(w.ko)}`]);
  return details('🙋 "~이다" (나는 ~해요)', formsGrid(rows));
});

const VERB_TENSES = ['prog', 'past', 'fut', 'aor', 'abil', 'nec', 'evid', 'cond', 'opt', 'imp', 'want'];

addWordDetail((w) => {
  if (w.pos !== 'v') return null;
  let tense = 'prog';
  let neg = false;
  const table = h('div');
  const seg = h('div', { class: 'chips-scroll', style: { margin: '0 -14px', padding: '2px 14px 8px' } });
  const negBtn = h('button', { class: 'chip', type: 'button' }, '부정형');
  const info = h('div', { class: 'small text-2', style: { margin: '4px 2px 10px' } });
  const render = () => {
    seg.replaceChildren(...VERB_TENSES.map((t) => h('button', {
      class: `chip ${t === tense ? 'active' : ''}`, type: 'button',
      onclick: () => { tense = t; render(); },
    }, TENSES[t].name)));
    negBtn.classList.toggle('active', neg);
    const T = TENSES[tense];
    info.textContent = `${T.tr} · ${T.ko} — 예) ${T.ex}`;
    table.replaceChildren(formsGrid(personsFor(tense).map((p) => [PERSONS[p], conjugate(w.tr, tense, p, { neg }).parts, PERSON_KO[p]])));
  };
  negBtn.addEventListener('click', () => { neg = !neg; render(); });
  render();
  return details('🔁 동사 활용표', h('div', null, seg, h('div', { class: 'row between' }, info, negBtn), table), true);
});
