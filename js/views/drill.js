// 연습 드릴 세션들
import { h, icon, speakBtn, shuffle, sample } from '../core/ui.js';
import { state, commit, addXP } from '../core/store.js';
import { isLearned, parseCardId } from '../core/deck.js';
import { speak } from '../core/tts.js';
import { tokenize } from '../core/tr.js';
import { tileDistractors } from '../core/lessonBuilder.js';
import { sfxComplete } from '../core/sfx.js';
import { WORD, WORDS } from '../data/vocab.js';
import { LESSONS, LESSON } from '../data/curriculum.js';
import { PAIRS } from '../data/alphabet.js';
import { runSession, renderDone, fmtDuration } from './session.js';
import { mcCore } from './exercises.js';
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

// ---------- 드릴 정의 ----------
const DRILLS = {
  quiz: {
    title: '단어 퀴즈', emoji: '⚡', desc: '배운 단어를 뜻 ↔ 튀르키예어로 빠르게 확인',
    build() {
      const { words } = wordPool();
      const listening = canListen();
      return sample(words, 15).map((w, i) => ({ type: 'mc', mode: i % 3 === 0 ? 'ko2tr' : listening && i % 3 === 1 ? 'listen2ko' : 'tr2ko', w, pool: words, key: `w:${w.id}` }));
    },
  },
  listen: {
    title: '듣기 훈련', emoji: '🎧', desc: '단어와 문장을 듣고 뜻 고르기', needsAudio: true,
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
    title: '문장 조립', emoji: '🧩', desc: '한국어 뜻을 보고 단어 타일로 문장 만들기',
    build() {
      const sents = sentencePool().filter((s) => tokenize(s.tr).length >= 2);
      return sample(sents, 10).map((s) => ({
        type: 'tiles', tr: s.tr, ko: s.ko, tokens: tokenize(s.tr), key: s.key,
        extra: tileDistractors(s.tr, sents.filter((x) => x !== s).map((x) => x.tr), 3),
      }));
    },
  },
  type: {
    title: '쓰기 연습', emoji: '⌨️', desc: '뜻을 보고 철자까지 정확하게 써 보기',
    build() {
      const { words } = wordPool();
      return sample(words.filter((w) => w.tr.length <= 20), 12).map((w) => ({ type: 'typeWord', w, key: `w:${w.id}` }));
    },
  },
  dictation: {
    title: '받아쓰기', emoji: '✍️', desc: '문장을 듣고 그대로 받아쓰기', needsAudio: true,
    build() {
      return sample(sentencePool(), 8).map((s) => ({ type: 'typeSent', dictation: true, tr: s.tr, ko: s.ko, key: s.key }));
    },
  },
  pairs: {
    title: '발음 구분', emoji: '👂', desc: 'f/p, v/b, s/ş, ı/i, ö/o … 헷갈리는 소리 듣고 고르기', needsAudio: true,
    build() {
      const all = PAIRS.flatMap((g) => g.pairs.map((p) => ({ g, p })));
      return sample(all, 14).map(({ g, p }) => ({ type: 'pair', group: g, pair: p, target: Math.random() < 0.5 ? 0 : 1 }));
    },
  },
  weak: {
    title: '약점 공략', emoji: '🎯', desc: '자주 틀린 단어·문장·문법만 모아서',
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
};

export const DRILL_LIST = Object.entries(DRILLS).map(([id, d]) => ({ id, ...d }));

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

export default {
  immersive: true,
  tab: 'practice',
  title: (p) => DRILLS[p[0]]?.title || '연습',
  render(root, [id], { go }) {
    const d = DRILLS[id];
    if (!d) { go('#/practice'); return null; }
    if (d.needsAudio && !canListen()) {
      root.append(h('div', { class: 'stage' }, h('div', { class: 'stage-body' }, h('div', { class: 'empty' },
        h('div', { class: 'e-emoji' }, '🔇'),
        h('p', { class: 'bold' }, '이 연습은 튀르키예어 음성이 필요해요'),
        h('p', { class: 'small' }, '설정에서 음성 설치 방법을 확인해 주세요.'),
        h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '16px' } },
          h('a', { class: 'btn btn-soft', href: '#/settings' }, '설정 열기'),
          h('a', { class: 'btn btn-outline', href: '#/practice' }, '돌아가기')),
      ))));
      return null;
    }
    const steps = d.build();
    if (!steps.length) {
      root.append(h('div', { class: 'stage' }, h('div', { class: 'stage-body' }, h('div', { class: 'empty' },
        h('div', { class: 'e-emoji' }, id === 'weak' ? '💪' : '📭'),
        h('p', { class: 'bold' }, id === 'weak' ? '틀린 문제가 없어요! 완벽해요.' : '연습할 재료가 아직 없어요'),
        h('p', { class: 'small' }, id === 'weak' ? '레슨과 연습에서 틀린 문제가 여기에 모여요.' : '레슨을 먼저 진행해 보세요.'),
        h('a', { class: 'btn btn-soft mt-16', href: '#/practice' }, '돌아가기'),
      ))));
      return null;
    }
    return runSession(root, {
      steps,
      renderers: { pair: renderPair },
      requeue: id !== 'pairs',
      onExit: () => go('#/practice'),
      onFinish: (sum) => {
        const xp = Math.max(3, sum.correct);
        addXP(xp);
        const rec = (state.drills[id] ||= { best: 0, n: 0 });
        rec.best = Math.max(rec.best, sum.acc);
        rec.n++;
        commit();
        sfxComplete();
        renderDone(root, {
          emoji: sum.acc >= 0.9 ? '🏆' : sum.acc >= 0.7 ? '💪' : '🌱',
          title: `${d.title} 완료!`,
          sub: sum.acc >= 0.9 ? '훌륭해요! 실력이 쑥쑥 늘고 있어요.' : '틀린 문제는 "약점 공략"에 모아 두었어요.',
          stats: [
            { v: `${sum.correct}/${sum.total}`, k: '첫 시도 정답', cls: 'ok' },
            { v: `+${xp}`, k: 'XP', cls: 'gold' },
            { v: fmtDuration(sum.ms), k: '시간', cls: 'brand' },
          ],
          buttons: [
            { label: '한 번 더', cls: 'btn-primary', onClick: () => go(`#/drill/${id}`) },
            { label: '연습 목록', onClick: () => go('#/practice') },
          ],
        });
      },
    });
  },
};
