import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schedule, newCard, preview, retrievability, intervalDays, DAY, formatInterval, maturity } from '../js/core/srs.js';

const T0 = new Date(2026, 0, 10, 9, 0, 0).getTime();
const opts = { fuzz: false, retention: 0.9 };

test('목표 기억률 90%에서 간격 = 안정도', () => {
  assert.ok(Math.abs(intervalDays(10, 0.9) - 10) < 1e-9);
  assert.ok(Math.abs(retrievability(10, 10) - 0.9) < 1e-9);
});

test('새 카드: 평가가 높을수록 간격이 길다', () => {
  const c = newCard('x', T0);
  const due = [1, 2, 3, 4].map((g) => schedule(c, g, T0, opts).due);
  assert.ok(due[0] < due[1] && due[1] <= due[2] && due[2] < due[3], due.join(','));
  const again = schedule(c, 1, T0, opts);
  assert.equal(again.state, 1);
  assert.ok(again.due - T0 <= 15 * 60 * 1000, '다시 = 몇 분 뒤');
  const good = schedule(c, 3, T0, opts);
  assert.equal(good.state, 2);
  assert.equal(good.ivl, 3);
});

test('복습 성공 시 안정도가 커지고, 실패 시 줄어든다', () => {
  let c = schedule(newCard('x', T0), 3, T0, opts);
  const t1 = c.due + 9 * 3600e3;
  const ok = schedule(c, 3, t1, opts);
  assert.ok(ok.s > c.s, `${ok.s} > ${c.s}`);
  const fail = schedule(c, 1, t1, opts);
  assert.ok(fail.s < c.s);
  assert.equal(fail.state, 3);
  assert.equal(fail.lapses, 1);
});

test('같은 날 재학습 후 알맞음 → 최소 1일', () => {
  const c = schedule(newCard('x', T0), 1, T0, opts);
  const g = schedule(c, 3, T0 + 11 * 60e3, opts);
  assert.equal(g.ivl, 1);
});

test('간격은 최대값을 넘지 않는다', () => {
  let c = schedule(newCard('x', T0), 4, T0, opts);
  let t = T0;
  for (let i = 0; i < 12; i++) {
    t = c.due + 3600e3;
    c = schedule(c, 4, t, { ...opts, maxIvl: 365 });
  }
  assert.ok(c.ivl <= 365);
});

test('미리보기는 4개 간격을 오름차순으로', () => {
  const c = schedule(newCard('x', T0), 3, T0, opts);
  const pv = preview(c, c.due + 3600e3, opts);
  assert.equal(pv.length, 4);
  for (let i = 1; i < 4; i++) assert.ok(pv[i] >= pv[i - 1]);
});

test('간격 표기', () => {
  assert.equal(formatInterval(10 * 60e3), '10분');
  assert.equal(formatInterval(DAY), '1일');
  assert.equal(formatInterval(5 * DAY), '5일');
  assert.equal(formatInterval(60 * DAY), '2개월');
  assert.equal(maturity({ state: 2, ivl: 30 }), 'mature');
  assert.equal(maturity({ state: 2, ivl: 3 }), 'young');
});
