import { test } from 'node:test';
import assert from 'node:assert/strict';
import { harmonyItem, caseItem, possItem, copulaItem, conjItem, NOUN_POOL, COPULA_POOL, VERB_POOL, mutations } from '../js/core/drillgen.js';
import { noun } from '../js/core/morph.js';
import { TENSES } from '../js/core/morph.js';

let seed = 42;
const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function check(item, label) {
  assert.ok(item.answer, `${label}: 정답 없음`);
  assert.ok(item.options.includes(item.answer), `${label}: 선택지에 정답 없음 ${item.q}`);
  const lower = item.options.map((o) => o.toLocaleLowerCase('tr-TR'));
  assert.equal(new Set(lower).size, lower.length, `${label}: 선택지 중복 ${item.options}`);
  assert.ok(item.options.length >= 2, `${label}: 선택지 부족 ${item.q} ${item.options}`);
  assert.ok(item.why && item.q && item.sub, `${label}: 설명 누락`);
  assert.ok(!/undefined|null|NaN/.test(`${item.q}${item.sub}${item.why}${item.options}`), `${label}: 깨진 문자열 ${item.q}`);
}

test('드릴 재료가 충분하다', () => {
  assert.ok(NOUN_POOL.length > 250, `명사 ${NOUN_POOL.length}`);
  assert.ok(COPULA_POOL.length > 60, `서술 ${COPULA_POOL.length}`);
  assert.ok(VERB_POOL.length > 100, `동사 ${VERB_POOL.length}`);
});

test('모든 종류의 문제가 올바르게 생성된다', () => {
  for (let i = 0; i < 300; i++) {
    check(harmonyItem(NOUN_POOL, rng), 'harmony');
    check(caseItem(NOUN_POOL, rng, { withPoss: i % 2 === 0 }), 'case');
    check(possItem(NOUN_POOL, rng), 'poss');
    check(copulaItem(COPULA_POOL, rng), 'copula');
    check(conjItem(VERB_POOL, rng, { tenses: Object.keys(TENSES) }), 'conj');
  }
});

test('오답 후보는 정답과 다르다', () => {
  const f = noun('ev', { cas: 'loc' });
  const ms = mutations(f.parts, 'ev');
  assert.ok(ms.includes('evda'));
  assert.ok(ms.includes('evte'));
  assert.ok(!ms.includes('evde'));
  const k = noun('kitap', { cas: 'acc' });
  assert.ok(mutations(k.parts, 'kitap').includes('kitapı'));
});
