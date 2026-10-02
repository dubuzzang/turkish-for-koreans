import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, WORD, CATS } from '../js/data/vocab.js';
import { UNITS, LESSONS } from '../js/data/curriculum.js';
import { LETTERS, PAIRS } from '../js/data/alphabet.js';
import { DAILY } from '../js/data/daily.js';
import { buildLessonSteps } from '../js/core/lessonBuilder.js';
import { tokenize, normalize } from '../js/core/tr.js';

const TR_CHARS = /^[A-Za-zÇĞİÖŞÜçğıöşüâîûÂÎÛ0-9\s.,!?'’"“”:;()\-—–%/]+$/;
const POS = new Set(['n', 'v', 'adj', 'adv', 'pron', 'num', 'int', 'phr', 'post', 'conj', 'q']);

test('단어 ID는 중복되지 않는다', () => {
  const seen = new Map();
  for (const w of WORDS) {
    assert.ok(!seen.has(w.id), `중복 ID ${w.id}: "${seen.get(w.id)}" / "${w.tr}"`);
    seen.set(w.id, w.tr);
  }
  assert.ok(WORDS.length >= 600, `단어 수 ${WORDS.length}`);
});

test('모든 단어에 뜻·품사·예문이 있고 형식이 올바르다', () => {
  for (const w of WORDS) {
    assert.ok(w.tr && w.ko, `${w.id} 비어 있음`);
    assert.ok(POS.has(w.pos), `${w.id} 품사 ${w.pos}`);
    assert.ok(TR_CHARS.test(w.tr), `${w.id} 문자: ${w.tr}`);
    assert.ok(w.ex && w.ex[0] && w.ex[1], `${w.id} 예문 없음`);
    assert.ok(TR_CHARS.test(w.ex[0]), `${w.id} 예문 문자: ${w.ex[0]}`);
    assert.ok(/[가-힣]/.test(w.ex[1]), `${w.id} 예문 번역`);
    if (w.pos === 'v') assert.ok(/m[ae]k$/.test(w.tr), `${w.id} 동사는 -mek/-mak`);
  }
});

test('모든 범주에 단어가 있다', () => {
  for (const c of CATS) assert.ok(WORDS.some((w) => w.cat === c.id), c.id);
});

test('레슨 구조가 올바르다', () => {
  const ids = new Set();
  for (const u of UNITS) {
    assert.ok(u.lessons.length > 0);
    for (const l of u.lessons) {
      assert.ok(!ids.has(l.id), `레슨 ID 중복 ${l.id}`);
      ids.add(l.id);
      for (const wid of l.words) assert.ok(WORD.has(wid), `${l.id}: 없는 단어 ${wid}`);
      assert.ok(l.words.length >= 5 && l.words.length <= 12, `${l.id} 단어 수`);
      for (const [tr, ko] of l.sents) {
        assert.ok(TR_CHARS.test(tr), `${l.id} 문장 문자: ${tr}`);
        assert.ok(/[가-힣]/.test(ko), `${l.id} 번역: ${ko}`);
      }
      for (const it of l.items || []) {
        assert.ok(it.opts.length >= 2 && it.a >= 0 && it.a < it.opts.length, `${l.id} 문항 ${it.q}`);
        assert.equal(new Set(it.opts).size, it.opts.length, `${l.id} 선택지 중복 ${it.q}`);
        assert.ok(it.why, `${l.id} 해설 없음: ${it.q}`);
      }
    }
  }
});

test('레슨 문제 생성: 모든 레슨', () => {
  let seed = 7;
  const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const l of LESSONS) {
    for (const review of [false, true]) {
      const steps = buildLessonSteps(l, { rng, listening: true, review });
      assert.ok(steps.length >= 10, `${l.id} 문제 수 ${steps.length}`);
      for (const s of steps) {
        if (s.type === 'tiles') {
          assert.equal(normalize(s.tokens.join(' ')), normalize(s.tr), `${l.id} 타일`);
          for (const x of s.extra) assert.ok(!s.tokens.map(normalize).includes(normalize(x)), `${l.id} 오답 타일이 정답과 겹침: ${x}`);
        }
        if (s.type === 'listenSent') assert.ok(s.options.includes(s.ko));
      }
    }
  }
});

test('알파벳 29자, 최소대립쌍, 오늘의 표현', () => {
  assert.equal(LETTERS.length, 29);
  assert.equal(new Set(LETTERS.map((l) => l.up)).size, 29);
  for (const g of PAIRS) for (const p of g.pairs) assert.equal(p.length, 4, `${g.id} ${p}`);
  assert.ok(DAILY.length >= 30);
  for (const [tr, ko] of DAILY) assert.ok(tr && ko);
});

test('예문 토큰화가 가능하다', () => {
  for (const w of WORDS) assert.ok(tokenize(w.ex[0]).length >= 1, w.id);
});
