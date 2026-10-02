// 연습 드릴 세션: 어휘·듣기 드릴 + 형태소(문법) 드릴
import { h, icon, speakBtn, shuffle, sample, setKids } from '../core/ui.js';
import { state, commit, addXP } from '../core/store.js';
import { parseCardId } from '../core/deck.js';
import { speak } from '../core/tts.js';
import { tokenize } from '../core/tr.js';
import { tileDistractors } from '../core/lessonBuilder.js';
import { sfxComplete } from '../core/sfx.js';
import { TENSES } from '../core/morph.js';
import { harmonyItem, caseItem, possItem, copulaItem, conjItem, NOUN_POOL, COPULA_POOL, VERB_POOL } from '../core/drillgen.js';
import { WORD } from '../data/vocab.js';
import { LESSONS, LESSON } from '../data/curriculum.js';
import { PAIRS } from '../data/alphabet.js';
import { runSession, renderDone, fmtDuration } from './session.js';
import { mcCore, typeCore } from './exercises.js';
import { canListen } from './lesson.js';

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

// ---------- 형태소 드릴 설정 화면 ----------
function setupScreen(root, id, d, go, start) {
  const cfg = { mode: 'mix', level: 1, tenses: ['prog', 'past'], ...(state.drills[id]?.cfg || {}) };
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
    h('div', null, h('div', { class: 'bold mb-8', style: { marginBottom: '8px' } }, '답하는 방식'), seg('mode', [['mc', '객관식'], ['mix', '섞어서'], ['type', '직접 쓰기']])),
    d.levels ? h('div', null, h('div', { class: 'bold', style: { marginBottom: '8px' } }, '난이도'), seg('level', [[1, '격어미만'], [2, '소유 + 격어미']])) : null,
    d.tenses ? h('div', null, h('div', { class: 'bold', style: { marginBottom: '8px' } }, '연습할 시제'), tenseBox, h('p', { class: 'small muted mt-8' }, '처음엔 현재진행·과거부터, 단원을 진행하며 하나씩 늘려 보세요.')) : null,
    h('a', { class: 'small', href: `#/grammar/${d.note}` }, '📖 관련 문법 노트 보기'),
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
    let cleanup = null;
    const begin = (cfg) => {
      let steps;
      if (d.morph) {
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
        renderers: { pair: renderPair, morph: renderMorph },
        requeue: id !== 'pairs',
        onExit: () => go('#/practice'),
        onFinish: (sum) => {
          const xp = Math.max(3, sum.correct);
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
              { label: '한 번 더', cls: 'btn-primary', onClick: () => (d.morph ? begin(cfg) : go(`#/drill/${id}`)) },
              { label: '연습 목록', onClick: () => go('#/practice') },
            ],
          });
        },
      });
    };
    if (d.morph) setupScreen(root, id, d, go, begin);
    else begin({});
    return () => cleanup?.();
  },
};
