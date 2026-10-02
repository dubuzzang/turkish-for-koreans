// 연습 드릴 세션: 어휘·듣기 드릴 + 형태소(문법) 드릴
import { h, icon, speakBtn, shuffle, sample, setKids } from '../core/ui.js';
import { state, commit, addXP } from '../core/store.js';
import { parseCardId } from '../core/deck.js';
import { speak } from '../core/tts.js';
import { tokenize } from '../core/tr.js';
import { tileDistractors } from '../core/lessonBuilder.js';
import { sfxComplete } from '../core/sfx.js';
import { TENSES } from '../core/morph.js';
import { numberTr, priceTr, timeTr, timeAtTr, fmtClock } from '../core/numbers.js';
import { checkAnswer } from '../core/tr.js';
import { harmonyItem, caseItem, possItem, copulaItem, conjItem, NOUN_POOL, COPULA_POOL, VERB_POOL } from '../core/drillgen.js';
import { WORD } from '../data/vocab.js';
import { LESSONS, LESSON } from '../data/curriculum.js';
import { PAIRS } from '../data/alphabet.js';
import { runSession, renderDone, fmtDuration } from './session.js';
import { mcCore, typeCore } from './exercises.js';
import { canListen } from './lesson.js';
import { sttSupported } from '../core/stt.js';

// ---------- 재료 ----------
export function learnedWords() {
  const ids = new Set();
  for (const cid of Object.keys(state.cards)) ids.add(parseCardId(cid).wordId);
  return [...ids].map((id) => WORD.get(id)).filter(Boolean);
}
/** 배운 단어가 적으면 앞 레슨 단어로 채움 */
function wordPool(min = 8) {
  const learned = learnedWords();
  if (learned.length >= min) return { words: learned, fallback: false };
  const extra = LESSONS.flatMap((l) => l.words).map((id) => WORD.get(id)).filter((w) => w && !learned.includes(w));
  return { words: [...learned, ...extra].slice(0, Math.max(min, 16)), fallback: true };
}
function sentencePool() {
  const done = LESSONS.filter((l) => state.lessons[l.id]?.done);
  const use = done.length ? done : LESSONS.slice(0, 2);
  return use.flatMap((l) => (l.sents || []).map(([tr, ko], i) => ({ tr, ko, lesson: l, key: `s:${l.id}:${i}` })));
}
/** 형태소 드릴: 배운 단어가 충분하면 배운 단어 위주 */
function morphPool(base) {
  const learned = new Set(learnedWords().map((w) => w.id));
  const mine = base.filter((w) => learned.has(w.id));
  if (mine.length >= 12) return Math.random() < 0.75 ? mine : base;
  return base;
}

// ---------- 드릴 정의 ----------
const DRILLS = {
  quiz: {
    group: 'vocab', title: '단어 퀴즈', emoji: '⚡', desc: '배운 단어를 뜻 ↔ 튀르키예어로 빠르게 확인',
    build() {
      const { words } = wordPool();
      const listening = canListen();
      return sample(words, 15).map((w, i) => ({ type: 'mc', mode: i % 3 === 0 ? 'ko2tr' : listening && i % 3 === 1 ? 'listen2ko' : 'tr2ko', w, pool: words, key: `w:${w.id}` }));
    },
  },
  listen: {
    group: 'vocab', title: '듣기 훈련', emoji: '🎧', desc: '단어와 문장을 듣고 뜻 고르기', needsAudio: true,
    build() {
      const { words } = wordPool();
      const sents = sentencePool();
      const steps = sample(words, 8).map((w) => ({ type: 'mc', mode: 'listen2ko', w, pool: words, key: `w:${w.id}` }));
      sample(sents, 6).forEach((s) => {
        const others = shuffle(sents.filter((x) => x.ko !== s.ko)).slice(0, 3).map((x) => x.ko);
        steps.push({ type: 'listenSent', tr: s.tr, ko: s.ko, options: shuffle([s.ko, ...others]), key: s.key });
      });
      return shuffle(steps);
    },
  },
  build: {
    group: 'vocab', title: '문장 조립', emoji: '🧩', desc: '한국어 뜻을 보고 단어 타일로 문장 만들기',
    build() {
      const sents = sentencePool().filter((s) => tokenize(s.tr).length >= 2);
      return sample(sents, 10).map((s) => ({
        type: 'tiles', tr: s.tr, ko: s.ko, tokens: tokenize(s.tr), key: s.key,
        extra: tileDistractors(s.tr, sents.filter((x) => x !== s).map((x) => x.tr), 3),
      }));
    },
  },
  type: {
    group: 'vocab', title: '쓰기 연습', emoji: '⌨️', desc: '뜻을 보고 철자까지 정확하게 써 보기',
    build() {
      const { words } = wordPool();
      return sample(words.filter((w) => w.tr.length <= 20), 12).map((w) => ({ type: 'typeWord', w, key: `w:${w.id}` }));
    },
  },
  dictation: {
    group: 'vocab', title: '받아쓰기', emoji: '✍️', desc: '문장을 듣고 그대로 받아쓰기', needsAudio: true,
    build() {
      return sample(sentencePool(), 8).map((s) => ({ type: 'typeSent', dictation: true, tr: s.tr, ko: s.ko, key: s.key }));
    },
  },
  speak: {
    group: 'vocab', title: '말하기', emoji: '🗣️', desc: '문장을 소리 내어 읽고 발음 확인 (음성 인식)', needsMic: true,
    build() {
      return sample(sentencePool(), 8).map((s) => ({ type: 'speak', tr: s.tr, ko: s.ko }));
    },
  },
  pairs: {
    group: 'vocab', title: '발음 구분', emoji: '👂', desc: 'f/p, v/b, s/ş, ı/i, ö/o … 헷갈리는 소리 듣고 고르기', needsAudio: true,
    build() {
      const all = PAIRS.flatMap((g) => g.pairs.map((p) => ({ g, p })));
      return sample(all, 14).map(({ g, p }) => ({ type: 'pair', group: g, pair: p, target: Math.random() < 0.5 ? 0 : 1 }));
    },
  },
  weak: {
    group: 'vocab', title: '약점 공략', emoji: '🎯', desc: '자주 틀린 단어·문장·문법만 모아서',
    count: () => Object.keys(state.mistakes).length,
    build() {
      const entries = Object.entries(state.mistakes).sort((a, b) => b[1].n - a[1].n || b[1].at - a[1].at).slice(0, 14);
      const { words } = wordPool();
      const steps = [];
      for (const [key] of entries) {
        const [kind, a, b] = key.split(':');
        if (kind === 'w' && WORD.get(a)) {
          const w = WORD.get(a);
          steps.push(steps.length % 2 ? { type: 'typeWord', w, key } : { type: 'mc', mode: 'ko2tr', w, pool: words, key });
        } else if (kind === 's' && LESSON.get(a)) {
          const l = LESSON.get(a);
          const s = l.sents?.[Number(b)];
          if (s) steps.push({ type: 'tiles', tr: s[0], ko: s[1], tokens: tokenize(s[0]), extra: tileDistractors(s[0], l.sents.map((x) => x[0]).filter((t) => t !== s[0]), 3), key });
        } else if (kind === 'i' && LESSON.get(a)) {
          const it = LESSON.get(a).items?.[Number(b)];
          if (it) steps.push({ type: 'choice', it, key });
        }
      }
      return steps;
    },
  },
  // ----- 문법(형태소) 드릴 — 문제가 무한히 만들어져요 -----
  harmony: {
    group: 'grammar', title: '모음조화', emoji: '🎵', desc: '복수·격·소유 어미의 모음 고르기', morph: true, note: 'harmony',
    make: (rng) => harmonyItem(morphPool(NOUN_POOL), rng),
  },
  cases: {
    group: 'grammar', title: '격어미(조사)', emoji: '🧷', desc: '을/를·에·에서·의·와를 튀르키예어로', morph: true, note: 'cases', levels: true,
    make: (rng, cfg) => caseItem(morphPool(NOUN_POOL), rng, { withPoss: cfg.level === 2 }),
  },
  poss: {
    group: 'grammar', title: '소유 접미사', emoji: '👜', desc: '내 ~, 네 ~, 그의 ~ 를 한 단어로', morph: true, note: 'possessive',
    make: (rng) => possItem(morphPool(NOUN_POOL), rng),
  },
  copula: {
    group: 'grammar', title: '"~이다"', emoji: '🙋', desc: '나는 학생이에요 → öğrenciyim (부정·질문·과거)', morph: true, note: 'copula',
    make: (rng) => copulaItem(morphPool(COPULA_POOL), rng),
  },
  conj: {
    group: 'grammar', title: '동사 활용', emoji: '🔁', desc: '시제 × 인칭 × 부정·질문 조합 연습', morph: true, note: 'prog', tenses: true,
    make: (rng, cfg) => conjItem(morphPool(VERB_POOL), rng, { tenses: cfg.tenses?.length ? cfg.tenses : ['prog', 'past'] }),
  },
  // ----- 숫자·시간 -----
  numbers: {
    group: 'num', title: '숫자', emoji: '🔢', desc: '듣고 숫자 쓰기 · 숫자 읽기 · 가격 말하기', note: 'numbers',
    defaults: { range: 2, mode: 'mix' },
    settings: [
      { key: 'range', label: '범위', opts: [[1, '0~20'], [2, '~100'], [3, '~1천'], [4, '~10만'], [5, '가격']] },
      { key: 'mode', label: '방식', opts: [['listen', '듣고 쓰기'], ['read', '읽기'], ['mix', '섞어서']] },
    ],
    gen: (rng, cfg, i) => {
      const range = Number(cfg.range) || 2;
      const n = pickNumber(rng, range);
      let mode = cfg.mode === 'mix' ? (i % 2 ? 'read' : 'listen') : cfg.mode;
      if (range === 5) mode = mode === 'listen' ? 'priceListen' : 'price';
      return { type: 'num', n, mode };
    },
    make: (rng, cfg) => {
      const n = pickNumber(rng, Number(cfg.range) || 2);
      return Number(cfg.range) === 5 ? { q: fmtPrice(n), sub: priceTr(n) } : { q: n.toLocaleString('ko-KR'), sub: numberTr(n) };
    },
  },
  time: {
    group: 'num', title: '시각 말하기', emoji: '🕒', desc: 'Saat kaç? 시계 보고 말하기 · 듣고 고르기', note: 'time',
    defaults: { tmode: 'mix' },
    settings: [{ key: 'tmode', label: '방식', opts: [['say', '몇 시예요?'], ['at', '몇 시에?'], ['listen', '듣고 고르기'], ['mix', '섞어서']] }],
    gen: (rng, cfg, i) => {
      const h = 1 + Math.floor(rng() * 12);
      const m = 5 * Math.floor(rng() * 12);
      const mode = cfg.tmode === 'mix' ? ['say', 'say', 'listen', 'at'][i % 4] : cfg.tmode;
      return { type: 'clock', h, m, mode };
    },
    make: (rng) => {
      const h = 1 + Math.floor(rng() * 12), m = 5 * Math.floor(rng() * 12);
      return { q: fmtClock(h, m), sub: timeTr(h, m) };
    },
  },
};

export const DRILL_LIST = Object.entries(DRILLS).map(([id, d]) => ({ id, ...d }));
const MORPH_LABEL = { harmony: '모음조화', case: '격어미', poss: '소유 접미사', copula: '"~이다"', conj: '동사 활용' };
const ALL_TENSES = ['prog', 'past', 'fut', 'aor', 'abil', 'nec', 'evid', 'cond', 'opt', 'imp', 'pastProg', 'want'];

function renderPair(step, api) {
  const [a, aKo, b, bKo] = step.pair;
  const word = step.target ? b : a;
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('headphones', 16), `발음 구분 · ${step.group.title}`),
    h('div', { class: 'ex-q' }, '어느 단어를 들었나요?'),
    h('div', { class: 'play-row' }, speakBtn(word, { size: 'xl' }), speakBtn(word, { size: 'xl', slow: true })),
  );
  const core = mcCore({
    el,
    items: [{ label: a, sub: aKo }, { label: b, sub: bKo }],
    correctIdx: step.target,
    result: { answer: word, sub: step.target ? bKo : aKo, why: step.group.desc, speakText: word },
  }, api);
  el.querySelector('.options')?.classList.add('two-col');
  return { el, onShow: () => speak(word), ...core };
}

function renderMorph(step, api) {
  const it = step.item;
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('target', 16), MORPH_LABEL[it.kind] || '문법'),
    h('div', { class: 'ex-q', style: { fontSize: '24px' } }, it.q),
    h('div', { class: 'text-2' }, it.sub),
  );
  const result = { answer: it.answer, speakText: it.say, why: it.why };
  if (step.mode === 'type') {
    const core = typeCore({ el, answers: [it.answer], strict: true, placeholder: '형태를 입력하세요', result }, api);
    return { el, ...core };
  }
  const core = mcCore({ el, items: it.options.map((o) => ({ label: o })), correctIdx: it.options.indexOf(it.answer), result, onCorrectSpeak: it.say }, api);
  return { el, ...core };
}

// ---------- 숫자 · 시각 ----------
function pickNumber(rng, range) {
  if (range === 1) return Math.floor(rng() * 21);
  if (range === 2) return 21 + Math.floor(rng() * 80);
  if (range === 3) return 100 + Math.floor(rng() * 900);
  if (range === 4) return 1000 + Math.floor(rng() * 99000);
  const kurus = [0, 0, 25, 50, 50, 75, 90, 95][Math.floor(rng() * 8)];
  return (1 + Math.floor(rng() * 300)) + kurus / 100;
}
const fmtPrice = (a) => `${Math.floor(a + 1e-9)},${String(Math.round((a - Math.floor(a + 1e-9)) * 100)).padStart(2, '0')} TL`;

function numDistractors(n, price) {
  const c = new Set();
  const add = (x) => { x = Math.round(x * 100) / 100; if (x > 0 && x !== n) c.add(x); };
  if (price) { add(n + 1); add(n - 1); add(n + 10); add(Math.floor(n) + 0.5); add(Math.floor(n) + 0.25); add(n + 0.25); }
  else {
    add(n + 1); add(n - 1); add(n + 10); add(n - 10);
    const s = String(n);
    if (s.length >= 2) add(Number([...s].reverse().join('')));
    if (n >= 100) { add(n + 100); add(n - 100); }
    if (n >= 1000) { add(n + 1000); add(n - 1000); }
  }
  return shuffle([...c]).slice(0, 3);
}

function clockSVG(h, m) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r1 = i % 3 === 0 ? 70 : 76;
    return `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + 86 * Math.sin(a)}" y2="${100 - 86 * Math.cos(a)}" stroke-width="${i % 3 === 0 ? 5 : 2.5}" stroke-linecap="round" />`;
  }).join('');
  const ma = m * 6, ha = (h % 12) * 30 + m * 0.5;
  const nums = [[12, 100, 52], [3, 150, 107], [6, 100, 160], [9, 50, 107]].map(([t, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="17" font-weight="700">${t}</text>`).join('');
  const box = h2('div', 'clock');
  box.innerHTML = `<svg viewBox="0 0 200 200" width="190" height="190" role="img" aria-label="${fmtClock(h, m)}">
    <circle cx="100" cy="100" r="94" class="face" stroke-width="3"/>
    <g class="ticks">${ticks}</g><g class="nums">${nums}</g>
    <line x1="100" y1="100" x2="${100 + 48 * Math.sin((ha * Math.PI) / 180)}" y2="${100 - 48 * Math.cos((ha * Math.PI) / 180)}" class="hour" stroke-width="8" stroke-linecap="round"/>
    <line x1="100" y1="100" x2="${100 + 72 * Math.sin((ma * Math.PI) / 180)}" y2="${100 - 72 * Math.cos((ma * Math.PI) / 180)}" class="min" stroke-width="5" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="6" class="pin"/></svg>`;
  return box;
}
const h2 = (tag, cls) => { const e = document.createElement(tag); e.className = cls; return e; };

function renderNum(step, api) {
  const n = step.n;
  const isPrice = step.mode === 'price' || step.mode === 'priceListen';
  const text = isPrice ? priceTr(n) : numberTr(n);
  const shown = isPrice ? fmtPrice(n) : n.toLocaleString('ko-KR');
  const el = h('div', { class: 'ex' });
  const result = { answer: `${shown} — ${text}`, speakText: text };
  if (step.mode === 'listen' || step.mode === 'priceListen') {
    const audio = canListen();
    el.append(
      h('div', { class: 'ex-label' }, icon('headphones', 16), audio ? '듣고 숫자로 쓰세요' : '읽고 숫자로 쓰세요'),
      audio ? h('div', { class: 'play-row' }, speakBtn(text, { size: 'xl' }), speakBtn(text, { size: 'xl', slow: true })) : h('div', { class: 'ex-q' }, text),
    );
    const input = h('input', { class: 'type-input', inputmode: 'decimal', autocomplete: 'off', placeholder: isPrice ? '예: 45,50' : '숫자 입력', 'aria-label': '숫자 입력', style: { textAlign: 'center', fontSize: '26px' } });
    input.addEventListener('input', () => api.setReady(input.value.trim().length > 0));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); api.trigger(); } });
    el.append(input);
    return {
      el,
      onShow: () => { if (audio) speak(text); setTimeout(() => input.focus({ preventScroll: true }), 120); },
      check() {
        input.disabled = true;
        let ok;
        if (isPrice) {
          const v = Number(input.value.replace(/\s|TL|lira/gi, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
          ok = Math.abs(v - n) < 0.001;
        } else ok = input.value.replace(/\D/g, '') === String(n);
        input.classList.add(ok ? 'ok' : 'bad');
        return { ok, ...result, mine: ok ? null : input.value };
      },
    };
  }
  const opts = shuffle([n, ...numDistractors(n, isPrice)]);
  el.append(
    h('div', { class: 'ex-label' }, icon('target', 16), isPrice ? '가격을 튀르키예어로' : '튀르키예어로 읽으면?'),
    h('div', { class: 'word-xl', style: { fontVariantNumeric: 'tabular-nums' } }, shown),
  );
  const core = mcCore({ el, items: opts.map((x) => ({ label: isPrice ? priceTr(x) : numberTr(x) })), correctIdx: opts.indexOf(n), result, onCorrectSpeak: text }, api);
  return { el, ...core };
}

function renderClock(step, api) {
  const { h: H, m: M } = step;
  const say = timeTr(H, M);
  const at = timeAtTr(H, M);
  const cands = [];
  const push = (hh, mm) => {
    hh = ((hh - 1 + 12) % 12) + 1;
    mm = ((mm % 60) + 60) % 60;
    if (!(hh === H && mm === M) && !cands.some(([a, b2]) => a === hh && b2 === mm)) cands.push([hh, mm]);
  };
  if (M !== 0 && M !== 30) push(H, 60 - M);
  push(H + 1, M); push(H - 1, M); push(H, M + 5); push(H, M - 5);
  const picks = shuffle([[H, M], ...shuffle(cands).slice(0, 3)]);
  const correctIdx = picks.findIndex(([a, b2]) => a === H && b2 === M);
  const el = h('div', { class: 'ex ex-center' });
  if (step.mode === 'listen') {
    const audio = canListen();
    el.append(
      h('div', { class: 'ex-label' }, icon('headphones', 16), audio ? '듣고 시각을 고르세요' : '읽고 시각을 고르세요'),
      audio ? h('div', { class: 'play-row' }, speakBtn(say, { size: 'xl' }), speakBtn(say, { size: 'xl', slow: true })) : h('div', { class: 'ex-q' }, say),
    );
    const core = mcCore({ el, items: picks.map(([a, b2]) => ({ label: fmtClock(a, b2) })), correctIdx, result: { answer: `${fmtClock(H, M)} — ${say}`, speakText: say } }, api);
    el.querySelector('.options')?.classList.add('two-col');
    return { el, onShow: () => { if (audio) speak(say); }, ...core };
  }
  const isAt = step.mode === 'at';
  el.append(
    h('div', { class: 'ex-label' }, icon('clock', 16), isAt ? 'Saat kaçta? · 몇 시에 만날까요?' : 'Saat kaç? · 몇 시예요?'),
    clockSVG(H, M),
    h('div', { class: 'bold', style: { fontSize: '22px', fontVariantNumeric: 'tabular-nums' } }, isAt ? `${fmtClock(H, M)}에 만나요` : fmtClock(H, M)),
  );
  const fn = isAt ? timeAtTr : timeTr;
  const why = M === 0 || M === 30 ? '정각은 그대로, 30분은 buçuk' : M < 30 ? `30분 전: 시를 <b>목적격</b>으로 + ${isAt ? 'geçe' : 'geçiyor'}` : `30분 후: <b>다음 시</b>를 여격으로 + ${isAt ? 'kala' : 'var'}`;
  const core = mcCore({ el, items: picks.map(([a, b2]) => ({ label: fn(a, b2) })), correctIdx, result: { answer: isAt ? at : say, speakText: isAt ? at : say, why } }, api);
  return { el, ...core };
}

// ---------- 형태소 드릴 설정 화면 ----------
function setupScreen(root, id, d, go, start) {
  const cfg = { mode: 'mix', level: 1, tenses: ['prog', 'past'], ...(d.defaults || {}), ...(state.drills[id]?.cfg || {}) };
  const save = () => { (state.drills[id] ||= { best: 0, n: 0 }).cfg = { ...cfg }; commit(); };
  const body = h('div', { class: 'col', style: { gap: '18px' } });
  const seg = (key, opts) => {
    const box = h('div', { class: 'seg', style: { width: '100%' } });
    const r = () => box.replaceChildren(...opts.map(([v, label]) => h('button', {
      class: cfg[key] === v ? 'on' : '', type: 'button', style: { flex: 1 },
      onclick: () => { cfg[key] = v; save(); r(); },
    }, label)));
    r();
    return box;
  };
  const tenseBox = h('div', { class: 'chips' });
  const renderTenses = () => tenseBox.replaceChildren(...ALL_TENSES.map((t) => h('button', {
    class: `chip ${cfg.tenses.includes(t) ? 'active' : ''}`, type: 'button',
    onclick: () => {
      cfg.tenses = cfg.tenses.includes(t) ? cfg.tenses.filter((x) => x !== t) : [...cfg.tenses, t];
      if (!cfg.tenses.length) cfg.tenses = [t];
      save(); renderTenses();
    },
  }, `${TENSES[t].name} ${TENSES[t].tr}`)));
  renderTenses();
  const sample1 = d.make(Math.random, cfg);
  setKids(body,
    h('div', { class: 'center' }, h('div', { style: { fontSize: '52px' } }, d.emoji), h('h1', { class: 'mt-8' }, d.title), h('p', { class: 'text-2 mt-4' }, d.desc)),
    h('div', { class: 'card flat' }, h('div', { class: 'small muted bold' }, '예시 문제'), h('div', { class: 'bold mt-4', style: { fontSize: '19px' } }, sample1.q), h('div', { class: 'small text-2' }, sample1.sub)),
    ...(d.settings
      ? d.settings.map((s) => h('div', null, h('div', { class: 'bold', style: { marginBottom: '8px' } }, s.label), seg(s.key, s.opts)))
      : [h('div', null, h('div', { class: 'bold', style: { marginBottom: '8px' } }, '답하는 방식'), seg('mode', [['mc', '객관식'], ['mix', '섞어서'], ['type', '직접 쓰기']]))]),
    d.levels ? h('div', null, h('div', { class: 'bold', style: { marginBottom: '8px' } }, '난이도'), seg('level', [[1, '격어미만'], [2, '소유 + 격어미']])) : null,
    d.tenses ? h('div', null, h('div', { class: 'bold', style: { marginBottom: '8px' } }, '연습할 시제'), tenseBox, h('p', { class: 'small muted mt-8' }, '처음엔 현재진행·과거부터, 단원을 진행하며 하나씩 늘려 보세요.')) : null,
    d.note ? h('a', { class: 'small', href: `#/grammar/${d.note}` }, '📖 관련 문법 노트 보기') : null,
  );
  const startBtn = h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button', onclick: () => start(cfg) }, '시작하기 (15문제)');
  root.replaceChildren(h('div', { class: 'stage' },
    h('div', { class: 'stage-head' }, h('a', { class: 'icon-btn', href: '#/practice', 'aria-label': '닫기' }, icon('x', 26)), h('div', { class: 'grow' })),
    h('div', { class: 'stage-body' }, body),
    h('div', { class: 'stage-foot' }, h('div', { class: 'stage-foot-inner' }, startBtn)),
  ));
}

function emptyState(root, emoji, title, sub, links) {
  root.append(h('div', { class: 'stage' }, h('div', { class: 'stage-body' }, h('div', { class: 'empty' },
    h('div', { class: 'e-emoji' }, emoji),
    h('p', { class: 'bold' }, title),
    h('p', { class: 'small' }, sub),
    h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '16px' } }, links),
  ))));
}

export default {
  immersive: true,
  tab: 'practice',
  title: (p) => DRILLS[p[0]]?.title || '연습',
  render(root, [id], { go }) {
    const d = DRILLS[id];
    if (!d) { go('#/practice'); return null; }
    if (d.needsAudio && !canListen()) {
      emptyState(root, '🔇', '이 연습은 튀르키예어 음성이 필요해요', '설정에서 음성 설치 방법을 확인해 주세요.', [
        h('a', { class: 'btn btn-soft', href: '#/settings' }, '설정 열기'),
        h('a', { class: 'btn btn-outline', href: '#/practice' }, '돌아가기'),
      ]);
      return null;
    }
    if (d.needsMic && !sttSupported) {
      emptyState(root, '🎙️', '이 브라우저는 음성 인식을 지원하지 않아요', '안드로이드·PC는 크롬, 아이폰은 사파리에서 말하기 연습을 할 수 있어요.', [
        h('a', { class: 'btn btn-outline', href: '#/practice' }, '돌아가기'),
      ]);
      return null;
    }
    let cleanup = null;
    const begin = (cfg) => {
      let steps;
      if (d.gen) {
        steps = Array.from({ length: 15 }, (_, i) => d.gen(Math.random, cfg, i));
      } else if (d.morph) {
        steps = Array.from({ length: 15 }, (_, i) => {
          const item = d.make(Math.random, cfg);
          const mode = cfg.mode === 'mix' ? (i % 3 === 2 ? 'type' : 'mc') : cfg.mode;
          return { type: 'morph', item, mode, key: null };
        });
      } else steps = d.build();
      if (!steps.length) {
        emptyState(root, id === 'weak' ? '💪' : '📭', id === 'weak' ? '틀린 문제가 없어요! 완벽해요.' : '연습할 재료가 아직 없어요',
          id === 'weak' ? '레슨과 연습에서 틀린 문제가 여기에 모여요.' : '레슨을 먼저 진행해 보세요.',
          [h('a', { class: 'btn btn-soft', href: '#/practice' }, '돌아가기')]);
        return;
      }
      root.replaceChildren();
      cleanup = runSession(root, {
        steps,
        renderers: { pair: renderPair, morph: renderMorph, num: renderNum, clock: renderClock },
        requeue: id !== 'pairs',
        onExit: () => go('#/practice'),
        onFinish: (sum) => {
          const xp = id === 'speak' ? steps.length * 2 : Math.max(3, sum.correct);
          addXP(xp);
          const rec = (state.drills[id] ||= { best: 0, n: 0 });
          rec.best = Math.max(rec.best || 0, sum.acc);
          rec.n = (rec.n || 0) + 1;
          commit();
          sfxComplete();
          renderDone(root, {
            emoji: sum.acc >= 0.9 ? '🏆' : sum.acc >= 0.7 ? '💪' : '🌱',
            title: `${d.title} 완료!`,
            sub: sum.acc >= 0.9 ? '훌륭해요! 실력이 쑥쑥 늘고 있어요.' : d.morph ? '틀린 문제의 설명(색깔별 형태소)을 다시 확인해 보세요.' : '틀린 문제는 "약점 공략"에 모아 두었어요.',
            stats: [
              { v: `${sum.correct}/${sum.total}`, k: '첫 시도 정답', cls: 'ok' },
              { v: `+${xp}`, k: 'XP', cls: 'gold' },
              { v: fmtDuration(sum.ms), k: '시간', cls: 'brand' },
            ],
            buttons: [
              { label: '한 번 더', cls: 'btn-primary', onClick: () => (d.morph || d.gen ? begin(cfg) : go(`#/drill/${id}`)) },
              { label: '연습 목록', onClick: () => go('#/practice') },
            ],
          });
        },
      });
    };
    if (d.morph || d.gen) setupScreen(root, id, d, go, begin);
    else begin({});
    return () => cleanup?.();
  },
};
