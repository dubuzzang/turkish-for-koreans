// 단어 복습 덱 — 인식(터키어→뜻) 카드부터 시작해, 익숙해지면 산출(뜻→터키어) 카드가 열린다.
import { state, commit, dayKey, recordReview } from './store.js';
import { schedule, newCard, preview, maturity, addDays } from './srs.js';

export const cardId = (wordId, dir = 'r') => `${wordId}|${dir}`;
export const parseCardId = (cid) => {
  const i = cid.lastIndexOf('|');
  return { wordId: cid.slice(0, i), dir: cid.slice(i + 1) };
};

const opts = () => ({ retention: state.settings.retention || 0.9 });

export const isLearned = (wordId) => !!state.cards[cardId(wordId, 'r')];

/**
 * 레슨·새 단어 학습에서 본 단어를 덱에 넣는다.
 * ratings: { wordId: 1|2|3 } — 레슨에서 틀린 단어는 1(오늘 다시), 기본 2(내일 복습)
 */
export function learnWords(ids, ratings = {}, now = Date.now()) {
  let added = 0;
  for (const id of ids) {
    const cid = cardId(id, 'r');
    if (state.cards[cid]) continue;
    state.cards[cid] = schedule(newCard(cid, now), ratings[id] ?? 2, now, opts());
    added++;
  }
  if (added) {
    const k = dayKey();
    state.newDays[k] = (state.newDays[k] || 0) + added;
    commit();
  }
  return added;
}

export function removeWord(wordId) {
  delete state.cards[cardId(wordId, 'r')];
  delete state.cards[cardId(wordId, 'p')];
  commit();
}

export function dueCards(now = Date.now()) {
  return Object.values(state.cards)
    .filter((c) => !c.suspended && c.due <= now)
    .sort((a, b) => a.due - b.due);
}

export function dueCount(now = Date.now()) {
  let n = 0;
  for (const c of Object.values(state.cards)) if (!c.suspended && c.due <= now) n++;
  return n;
}

/** 복습 평가 적용. 인식 카드가 3일 이상 기억되면 산출 카드를 연다. */
export function reviewCard(cid, g, now = Date.now()) {
  const c = state.cards[cid];
  if (!c) return null;
  const next = schedule(c, g, now, opts());
  state.cards[cid] = next;
  const { wordId, dir } = parseCardId(cid);
  if (dir === 'r' && g >= 3 && next.s >= 2.5) {
    const pid = cardId(wordId, 'p');
    if (!state.cards[pid]) {
      const p = newCard(pid, now);
      p.due = addDays(now, 1);
      state.cards[pid] = p;
    }
  }
  recordReview();
  commit();
  return next;
}

export const previewCard = (cid, now = Date.now()) => preview(state.cards[cid], now, opts());

export function wordStatus(wordId) {
  const r = state.cards[cardId(wordId, 'r')];
  const p = state.cards[cardId(wordId, 'p')];
  if (!r) return 'none';
  const order = ['none', 'new', 'learning', 'young', 'mature'];
  const a = maturity(r), b = p ? maturity(p) : 'none';
  // 두 방향 중 더 약한 쪽 기준 (산출 카드가 아직 없으면 인식 카드 기준)
  return p ? (order.indexOf(a) < order.indexOf(b) ? a : b) : a;
}

export function deckStats(now = Date.now()) {
  const words = new Set();
  let mature = 0, young = 0, learning = 0;
  for (const c of Object.values(state.cards)) {
    const { wordId } = parseCardId(c.id);
    words.add(wordId);
  }
  for (const w of words) {
    const st = wordStatus(w);
    if (st === 'mature') mature++;
    else if (st === 'young') young++;
    else learning++;
  }
  return { words: words.size, mature, young, learning, due: dueCount(now) };
}

export const newToday = () => state.newDays[dayKey()] || 0;
