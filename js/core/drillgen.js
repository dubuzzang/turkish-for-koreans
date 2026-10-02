// 형태소 드릴 문제 생성기 (DOM 없음): 모음조화 · 격어미 · 소유 · "~이다" · 동사 활용
import { noun, copula, conjugate, harmonyVowel, endsVowel, endsVoiceless, softens, CASE_KO, PERSONS, PERSON_KO, POSS_KO, TENSES, personsFor } from './morph.js';
import { headKo, josa, CASE_GLOSS } from './ko.js';
import { WORDS } from '../data/vocab.js';
import { trLower } from './tr.js';

const BACKV = 'aıou';
const vClass = (v) => (BACKV.includes(v) ? '뒤 모음' : '앞 모음');

function rngPick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
function rngShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export const NOUN_POOL = WORDS.filter((w) => w.pos === 'n' && !w.nodrill && !/\s/.test(w.tr) && w.tr.length >= 2);
export const COPULA_POOL = WORDS.filter((w) => ['jobs', 'countries', 'adjectives', 'emotions', 'taste'].includes(w.cat)
  && (w.pos === 'n' || w.pos === 'adj') && !w.nodrill && !w.proper && !/\s/.test(w.tr));
export const VERB_POOL = WORDS.filter((w) => w.pos === 'v');

/** 색칠된 형태소 HTML */
export const partsHTML = (parts) => parts.map((p) => `<span class="m m-${p.k}">${p.t}</span>`).join('');

// ---------- 오답 만들기 ----------
const SWAP2 = { a: ['e'], e: ['a'] };
const SWAP4 = { ı: ['i', 'u', 'ü'], i: ['ı', 'u', 'ü'], u: ['ü', 'ı', 'i'], ü: ['u', 'i', 'ı'] };
const CSWAP = { d: 't', t: 'd', c: 'ç', ç: 'c' };
const UNSOFT = { b: 'p', c: 'ç', d: 't', ğ: 'k', g: 'k' };

export function mutations(parts, dictForm) {
  const out = new Set();
  const text = (ps) => ps.map((p) => p.t).join('');
  parts.forEach((p, i) => {
    if (p.k === 'stem' || p.k === 'apos' || !p.t.trim()) return;
    [...p.t].forEach((ch, j) => {
      const swaps = SWAP2[ch] || SWAP4[ch] || [];
      for (const s of swaps) {
        const np = parts.slice();
        np[i] = { ...p, t: p.t.slice(0, j) + s + p.t.slice(j + 1) };
        out.add(text(np));
      }
    });
    const first = p.t.trimStart()[0];
    if (CSWAP[first] && p.k !== 'pers') {
      const np = parts.slice();
      const lead = p.t.length - p.t.trimStart().length;
      np[i] = { ...p, t: p.t.slice(0, lead) + CSWAP[first] + p.t.slice(lead + 1) };
      out.add(text(np));
    }
    if (p.k === 'buf') out.add(text(parts.filter((_, k) => k !== i)));
  });
  // 어간 연화를 되돌리거나(kitabı → kitapı) 잘못 적용
  const stem = parts[0];
  if (stem && dictForm && stem.t !== dictForm && stem.k === 'stem') {
    out.add(dictForm + text(parts.slice(1)));
  } else if (stem && dictForm && stem.t === dictForm) {
    const last = trLower(dictForm).slice(-1);
    const next = parts[1]?.t?.[0];
    if ('pçtk'.includes(last) && next && 'aeıioöuü'.includes(next)) {
      const map = { p: 'b', ç: 'c', t: 'd', k: 'ğ' };
      out.add(dictForm.slice(0, -1) + map[last] + text(parts.slice(1)));
    }
  }
  return [...out];
}

function optionsFor(correct, candidates, rng, n = 3) {
  const seen = new Set([trLower(correct)]);
  const opts = [];
  for (const c of rngShuffle(candidates, rng)) {
    const k = trLower(c);
    if (seen.has(k) || !c) continue;
    seen.add(k);
    opts.push(c);
    if (opts.length >= n) break;
  }
  return rngShuffle([correct, ...opts], rng);
}

// ---------- 설명 ----------
export function explainNoun(w, form, { cas = 'nom', pl = false, poss = 0 } = {}) {
  const base = w.tr;
  const v = harmonyVowel(base, w.front);
  const lines = [];
  lines.push(`마지막 모음 <b>${harmonyVowel(base)}</b>(${vClass(v)})${w.front ? ' — 외래어 예외로 앞 모음 어미' : ''}`);
  if ((cas === 'loc' || cas === 'abl') && !poss && !pl) {
    const last = trLower(base).slice(-1);
    lines.push(endsVoiceless(base) ? `끝소리 <b>${last}</b>는 무성음 → d가 <b>t</b>로` : `끝소리 <b>${last}</b>는 유성음 → <b>d</b> 그대로`);
  }
  const stem = form.parts[0].t;
  if (stem !== base) {
    lines.push(w.drop ? `모음 탈락: ${base} → <b>${stem}</b>-` : `모음 어미 앞 연음: ${base} → <b>${stem}</b>-`);
  }
  if (form.parts.some((p) => p.k === 'buf')) {
    const bufs = form.parts.filter((p) => p.k === 'buf').map((p) => p.t.trim()).filter(Boolean);
    if (bufs.length) lines.push(`연결 자음 <b>${bufs.join(', ')}</b>`);
  }
  if (w.proper) lines.push("고유명사라 아포스트로피(')로 어미를 구분해요");
  return `${partsHTML(form.parts)}<br>${lines.join(' · ')}`;
}

// ---------- 문제 생성기 ----------
const HARMONY_SUFFIXES = [
  { key: 'pl', label: '복수 -lar/-ler', ko: '들', opts: { pl: true } },
  { key: 'loc', label: '장소 -da/-de', ko: '에(서)', opts: { cas: 'loc' } },
  { key: 'abl', label: '출발 -dan/-den', ko: '에서/부터', opts: { cas: 'abl' } },
  { key: 'dat', label: '방향 -(y)a/-(y)e', ko: '에/로', opts: { cas: 'dat' } },
  { key: 'acc', label: '목적 -(y)ı', ko: '을/를', opts: { cas: 'acc' } },
  { key: 'gen', label: '속격 -(n)ın', ko: '의', opts: { cas: 'gen' } },
  { key: 'poss1', label: '나의 -(ı)m', ko: '내', opts: { poss: 1 } },
];

export function harmonyItem(pool, rng = Math.random) {
  const w = rngPick(pool.filter((x) => !x.proper), rng);
  const s = rngPick(HARMONY_SUFFIXES, rng);
  const form = noun(w, s.opts);
  const muts = mutations(form.parts, w.tr);
  // 변형이 부족하면(예: havlu+m) 모음을 잘못 끼운 형태로 보충
  if (muts.length < 3 && s.key === 'poss1') ['ım', 'im', 'um', 'üm'].forEach((x) => muts.push(w.tr + x));
  if (muts.length < 3) HARMONY_SUFFIXES.filter((o) => o.key !== s.key).forEach((o) => muts.push(noun(w, o.opts).text));
  return {
    kind: 'harmony',
    q: `${w.tr} + ${s.label}`,
    sub: `${headKo(w.ko)} → ${s.key === 'poss1' ? `내 ${headKo(w.ko)}` : s.key === 'acc' ? josa(headKo(w.ko), '을/를') : headKo(w.ko) + s.ko}`,
    answer: form.text,
    options: optionsFor(form.text, muts, rng),
    why: explainNoun(w, form, s.opts),
    say: form.text,
  };
}

const CASE_CUES = {
  acc: (k) => `${josa(k, '을/를')} (정해진 대상)`,
  dat: (k) => `${k}에 / ${josa(k, '으로/로')} (방향)`,
  loc: (k) => `${k}에 / ${k}에서 (장소)`,
  abl: (k) => `${k}에서 / ${k}부터 (출발)`,
  gen: (k) => `${k}의`,
  ins: (k) => `${josa(k, '과/와')} / ${josa(k, '으로/로')}`,
};

export function caseItem(pool, rng = Math.random, { withPoss = false } = {}) {
  const w = rngPick(pool, rng);
  const cas = rngPick(['acc', 'dat', 'loc', 'abl', 'gen', 'ins', 'loc', 'dat'], rng);
  const poss = withPoss && rng() < 0.5 && !w.proper ? rngPick([1, 2, 3, 4], rng) : 0;
  const form = noun(w, { cas, poss });
  const k = headKo(w.ko);
  const kk = poss ? `${POSS_KO[poss].replace('의', '')} ${k}`.replace('나 ', '내 ').replace('너 ', '네 ') : k;
  const cases = ['acc', 'dat', 'loc', 'abl', 'gen', 'ins'].filter((c) => c !== cas).map((c) => noun(w, { cas: c, poss }).text);
  return {
    kind: 'case',
    q: `${w.tr}${poss ? ` + ${POSS_KO[poss]}` : ''} + ${CASE_KO[cas].name}`,
    sub: CASE_CUES[cas](kk),
    answer: form.text,
    options: optionsFor(form.text, [...mutations(form.parts, w.tr), ...cases.slice(0, 1)], rng),
    why: explainNoun(w, form, { cas, poss }),
    say: form.text,
  };
}

export function possItem(pool, rng = Math.random) {
  const w = rngPick(pool.filter((x) => !x.proper), rng);
  const p = rngPick([1, 2, 3, 4, 5, 6], rng);
  const form = noun(w, { poss: p });
  const others = [1, 2, 3, 4, 5, 6].filter((x) => x !== p).map((x) => noun(w, { poss: x }).text);
  return {
    kind: 'poss',
    q: `${POSS_KO[p]} + ${w.tr}`,
    sub: `${POSS_KO[p]} ${headKo(w.ko)}`,
    answer: form.text,
    options: optionsFor(form.text, [...mutations(form.parts, w.tr), ...rngShuffle(others, rng).slice(0, 2)], rng),
    why: `${explainNoun(w, form, { poss: p })}${p === 3 && endsVowel(w.tr) ? ' · 모음 뒤 3인칭은 <b>-sı</b>' : ''}`,
    say: form.text,
  };
}

export function copulaItem(pool, rng = Math.random) {
  const w = rngPick(pool, rng);
  const p = rngPick([1, 2, 3, 4, 5, 6], rng);
  const r = rng();
  const mode = r < 0.55 ? {} : r < 0.75 ? { q: true } : r < 0.9 ? { neg: true } : { past: true };
  const form = copula(w, p, mode);
  const tag = mode.q ? ' · 질문(~니?)' : mode.neg ? ' · 부정(아니다)' : mode.past ? ' · 과거(~였다)' : '';
  const others = [1, 2, 3, 4, 5, 6].filter((x) => x !== p).map((x) => copula(w, x, mode).text);
  const tail = form.parts.slice(1).map((x) => x.t).join('').trim();
  return {
    kind: 'copula',
    q: `${PERSONS[p]} + ${w.tr}${tag}`,
    sub: `${PERSON_KO[p]} · ${headKo(w.ko)} · ~이다`,
    answer: form.text,
    options: optionsFor(form.text, [...mutations(form.parts, w.tr), ...rngShuffle(others, rng).slice(0, 2)], rng),
    why: `${partsHTML(form.parts)}<br>${p === 3 && !mode.q && !mode.neg && !mode.past ? '3인칭은 어미 없이 그대로' : `${PERSONS[p]} → ${tail ? `<b>${tail}</b>` : '–'}`}${softens(w) && (p === 1 || p === 4) && !mode.q && !mode.neg && !mode.past ? ' · 모음 앞 연음' : ''}`,
    say: form.text,
  };
}

export const DEFAULT_TENSES = ['prog', 'past'];

export function conjItem(pool, rng = Math.random, { tenses = DEFAULT_TENSES, negRate = 0.25, qRate = 0.2 } = {}) {
  const v = rngPick(pool, rng);
  const tense = rngPick(tenses, rng);
  const p = rngPick(personsFor(tense), rng);
  const r = rng();
  const opts = tense === 'opt' || tense === 'imp' ? (r < 0.3 ? { neg: true } : {}) : r < negRate ? { neg: true } : r < negRate + qRate ? { q: true } : {};
  const form = conjugate(v.tr, tense, p, opts);
  const others = personsFor(tense).filter((x) => x !== p).map((x) => conjugate(v.tr, tense, x, opts).text);
  const otherTense = Object.keys(TENSES).filter((t) => t !== tense && tenses.includes(t)).map((t) => conjugate(v.tr, t, p, opts).text).filter(Boolean);
  const T = TENSES[tense];
  const tag = opts.neg ? ' · 부정' : opts.q ? ' · 질문' : '';
  return {
    kind: 'conj',
    q: `${v.tr} → ${PERSONS[p]} · ${T.name}${tag}`,
    sub: `${headKo(v.ko)} · ${PERSON_KO[p]} · ${T.ko}`,
    answer: form.text,
    options: optionsFor(form.text, [...rngShuffle(others, rng).slice(0, 2), ...otherTense.slice(0, 1), ...mutations(form.parts, null)], rng),
    why: `${partsHTML(form.parts)}<br>${T.name} ${T.tr} · ${PERSONS[p]}${tag}`,
    say: form.text,
  };
}

export { CASE_GLOSS };
