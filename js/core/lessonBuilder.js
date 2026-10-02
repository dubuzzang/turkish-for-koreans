// 레슨 → 문제 목록 생성 (DOM 없음, 테스트 가능)
// 학습 원리: 짧은 노출 → 즉시 인출(객관식/듣기) → 짝 맞추기 → 문법 확인 → 문장 조립(산출) → 타이핑(능동 회상)
import { WORD, WORDS } from '../data/vocab.js';
import { tokenize, normalize } from './tr.js';

function rngShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  // 마지막 덩어리가 너무 작으면 앞 덩어리에 합침
  if (out.length > 1 && out[out.length - 1].length < 3) {
    const last = out.pop();
    out[out.length - 1].push(...last);
  }
  return out;
};

/** 같은 레슨 → 같은 단원 → 같은 범주 → 전체 순으로 오답 후보 */
export function distractorWords(w, pool, n, rng = Math.random) {
  const seen = new Set([w.id]);
  const meaning = new Set([w.ko]);
  const trs = new Set([normalize(w.tr)]);
  const out = [];
  const tryAdd = (x) => {
    if (out.length >= n || !x || seen.has(x.id) || meaning.has(x.ko) || trs.has(normalize(x.tr))) return;
    seen.add(x.id); meaning.add(x.ko); trs.add(normalize(x.tr));
    out.push(x);
  };
  rngShuffle(pool, rng).forEach(tryAdd);
  rngShuffle(WORDS.filter((x) => x.cat === w.cat), rng).forEach(tryAdd);
  rngShuffle(WORDS, rng).slice(0, 60).forEach(tryAdd);
  return out;
}

/** 문장 타일용 오답 단어: 같은 단원 다른 문장의 단어 */
export function tileDistractors(sentence, otherSentences, n, rng = Math.random) {
  const have = new Set(tokenize(sentence).map(normalize));
  const cand = [];
  for (const s of otherSentences) {
    for (const t of tokenize(s)) {
      const k = normalize(t);
      if (!have.has(k) && !cand.some((c) => normalize(c) === k)) cand.push(t);
    }
  }
  return rngShuffle(cand, rng).slice(0, n);
}

/**
 * opts.listening: 듣기 문제 포함 여부(TTS 사용 가능할 때)
 * opts.review: 이미 끝낸 레슨 복습 — 단어 소개 카드 생략
 * opts.speaking: 말하기 문제 포함 여부
 */
export function buildLessonSteps(lesson, opts = {}) {
  const rng = opts.rng || Math.random;
  const listening = opts.listening !== false;
  const review = !!opts.review;
  const words = lesson.words.map((id) => WORD.get(id)).filter(Boolean);
  const unitSents = (lesson.unit?.lessons || [lesson]).flatMap((l) => l.sents || []);
  const steps = [];

  if (lesson.tip && !review) steps.push({ type: 'tip', tip: lesson.tip });

  // 1) 단어: 3~4개씩 소개 → 바로 인출
  chunk(words, 4).forEach((group, gi) => {
    if (!review) group.forEach((w) => steps.push({ type: 'intro', w }));
    rngShuffle(group, rng).forEach((w, i) => {
      const mode = listening && (i + gi) % 2 === 1 ? 'listen2ko' : 'tr2ko';
      if (i < 3 || review) steps.push({ type: 'mc', mode, w, pool: words, key: `w:${w.id}` });
    });
    if (group.length >= 3) steps.push({ type: 'match', words: group.slice(0, 5) });
  });

  // 2) 문법 확인
  (lesson.items || []).forEach((it, i) => steps.push({ type: 'choice', it, key: `i:${lesson.id}:${i}` }));

  // 3) 문장: 조립(뜻→튀르키예어) 위주, 듣고 뜻 고르기 섞기
  const sents = lesson.sents || [];
  sents.forEach(([tr, ko], i) => {
    const others = unitSents.filter(([t]) => t !== tr).map(([t]) => t);
    const tokens = tokenize(tr);
    const key = `s:${lesson.id}:${i}`;
    if (listening && i % 3 === 2) {
      const distract = rngShuffle(unitSents.filter(([t, k]) => t !== tr && k !== ko), rng).slice(0, 3).map(([, k]) => k);
      steps.push({ type: 'listenSent', tr, ko, options: rngShuffle([ko, ...distract], rng), key });
    } else if (tokens.length >= 2) {
      steps.push({ type: 'tiles', tr, ko, tokens, extra: tileDistractors(tr, others, Math.min(4, Math.max(2, 6 - tokens.length)), rng), key });
    } else {
      steps.push({ type: 'typeSent', tr, ko, key });
    }
  });

  // 4) 능동 회상: 뜻 보고 고르기 → 직접 쓰기
  const prod = rngShuffle(words.filter((w) => w.tr.length <= 18), rng);
  prod.slice(0, 2).forEach((w) => steps.push({ type: 'mc', mode: 'ko2tr', w, pool: words, key: `w:${w.id}` }));
  prod.slice(2, 4).forEach((w) => steps.push({ type: 'typeWord', w, key: `w:${w.id}` }));

  // 5) 말하기 (지원 기기)
  if (opts.speaking && sents.length) {
    const s = sents[Math.floor(rng() * sents.length)];
    steps.push({ type: 'speak', tr: s[0], ko: s[1] });
  }
  return steps;
}

export const isGraded = (step) => !['tip', 'intro', 'grammar'].includes(step.type);
