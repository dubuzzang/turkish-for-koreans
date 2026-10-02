// FSRS-5 간격 반복 스케줄러 (기본 파라미터)
// 참고: https://github.com/open-spaced-repetition — 망각 곡선 R(t,S) = (1 + F·t/S)^D
// 상태: 0 새 카드 · 1 학습 중 · 2 복습 · 3 재학습

export const W = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192,
  1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
];
const DECAY = -0.5;
const FACTOR = 19 / 81;
export const DAY = 86400000;
export const Rating = { Again: 1, Hard: 2, Good: 3, Easy: 4 };
const RELEARN_MS = 10 * 60 * 1000;

const clampD = (d) => Math.min(10, Math.max(1, d));
const initD = (g) => clampD(W[4] - Math.exp(W[5] * (g - 1)) + 1);
const initS = (g) => Math.max(0.1, W[g - 1]);
function nextD(d, g) {
  const delta = -W[6] * (g - 3);
  const d1 = d + (delta * (10 - d)) / 9;
  return clampD(W[7] * initD(4) + (1 - W[7]) * d1);
}
function recallS(d, s, r, g) {
  const hard = g === 2 ? W[15] : 1;
  const easy = g === 4 ? W[16] : 1;
  return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * hard * easy);
}
function forgetS(d, s, r) {
  return Math.min(s, W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]));
}
const shortS = (s, g) => s * Math.exp(W[17] * (g - 3 + W[18]));

export function retrievability(elapsedDays, s) {
  return Math.pow(1 + (FACTOR * elapsedDays) / s, DECAY);
}
export function intervalDays(s, retention = 0.9) {
  return (s / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
}

export function startOfDay(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
/** 로컬 날짜 기준 n일 뒤 0시 (서머타임에도 안전) */
export function addDays(ms, n) {
  const d = new Date(startOfDay(ms));
  d.setDate(d.getDate() + n);
  return d.getTime();
}

export function newCard(id, now = Date.now()) {
  return { id, state: 0, s: 0, d: 0, due: now, last: 0, reps: 0, lapses: 0 };
}

/**
 * 카드에 평가(1~4)를 적용한 새 카드를 돌려준다.
 * opts: { retention, maxIvl, fuzz(rng) }
 */
export function schedule(card, g, now = Date.now(), opts = {}) {
  const retention = opts.retention ?? 0.9;
  const maxIvl = opts.maxIvl ?? 365;
  const rng = opts.rng ?? Math.random;
  const c = { ...card };
  if (c.state === 0 || !c.last) {
    c.d = initD(g);
    c.s = initS(g);
  } else {
    const elapsed = Math.max(0, (now - c.last) / DAY);
    if (elapsed < 1 && startOfDay(now) === startOfDay(c.last)) {
      c.s = shortS(c.s, g);
    } else {
      const r = retrievability(elapsed, c.s);
      c.s = g === 1 ? forgetS(c.d, c.s, r) : recallS(c.d, c.s, r, g);
    }
    c.d = nextD(c.d, g);
  }
  c.s = Math.max(0.1, c.s);
  c.last = now;
  c.reps = (c.reps || 0) + 1;
  if (g === 1) {
    if (card.state === 2) c.lapses = (c.lapses || 0) + 1;
    c.state = card.state === 0 || card.state === 1 ? 1 : 3;
    c.due = now + RELEARN_MS;
    c.ivl = 0;
  } else {
    let days = intervalDays(c.s, retention);
    if (days >= 3 && opts.fuzz !== false) days *= 0.95 + rng() * 0.1;
    days = Math.min(maxIvl, Math.max(1, Math.round(days)));
    c.state = 2;
    c.ivl = days;
    c.due = addDays(now, days);
  }
  return c;
}

/** 각 버튼을 눌렀을 때 다음 복습까지의 간격 (ms) */
export function preview(card, now = Date.now(), opts = {}) {
  return [1, 2, 3, 4].map((g) => schedule(card, g, now, { ...opts, fuzz: false }).due - now);
}

export function formatInterval(ms) {
  const min = ms / 60000;
  if (min < 60) return `${Math.max(1, Math.round(min))}분`;
  const days = ms / DAY;
  if (days < 1.5) return '1일';
  if (days < 30) return `${Math.round(days)}일`;
  if (days < 365) {
    const m = days / 30;
    return `${m < 10 ? Math.round(m * 10) / 10 : Math.round(m)}개월`;
  }
  return `${Math.round((days / 365) * 10) / 10}년`;
}

/** 카드 성숙도: new · learning · young(21일 미만) · mature */
export function maturity(card) {
  if (!card) return 'none';
  if (card.state === 0) return 'new';
  if (card.state === 1 || card.state === 3) return 'learning';
  return (card.ivl || 0) >= 21 ? 'mature' : 'young';
}
