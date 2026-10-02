import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trLower, trUpper, normalize, checkAnswer, fold, tokenize, accentHint } from '../js/core/tr.js';

test('튀르키예어 대소문자 규칙 (İ/i, I/ı)', () => {
  assert.equal(trLower('İSTANBUL'), 'istanbul');
  assert.equal(trLower('IRMAK'), 'ırmak');
  assert.equal(trUpper('istanbul'), 'İSTANBUL');
  assert.equal(trUpper('ılık'), 'ILIK');
});

test('정규화: 구두점·아포스트로피·공백', () => {
  assert.equal(normalize("  İstanbul'da,  çok   güzel! "), 'istanbulda çok güzel');
  assert.equal(normalize('— Hoş geldin!'), 'hoş geldin');
});

test('채점: 정확/특수문자/오타/오답', () => {
  assert.equal(checkAnswer('Teşekkürler', 'teşekkürler').level, 'exact');
  const acc = checkAnswer('tesekkurler', 'teşekkürler');
  assert.equal(acc.level, 'accent');
  assert.equal(acc.ok, true);
  assert.equal(checkAnswer('tesekkurler', 'teşekkürler', { strict: true }).ok, false);
  const typo = checkAnswer('merhba', 'merhaba');
  assert.equal(typo.level, 'typo');
  assert.equal(typo.ok, true);
  assert.equal(checkAnswer('evda', 'evde', { strict: true }).ok, false);
  assert.equal(checkAnswer('kedi', 'köpek').ok, false);
  assert.equal(checkAnswer('', 'ev').level, 'empty');
  assert.equal(checkAnswer('Istanbul', 'İstanbul').ok, true, '대문자 I 입력도 허용(특수문자 경고)');
});

test('여러 정답 허용', () => {
  assert.equal(checkAnswer('ağabey', ['abi', 'ağabey']).level, 'exact');
});

test('fold·tokenize·accentHint', () => {
  assert.equal(fold('çğıöşü'), 'cgiosu');
  assert.deepEqual(tokenize("Merhaba, İstanbul'da mısın?"), ['Merhaba', "İstanbul'da", 'mısın']);
  assert.deepEqual(tokenize('— Nasılsın? — Fena değil.'), ['Nasılsın', 'Fena', 'değil']);
  assert.equal(accentHint('sis', 'şiş'), 'ş');
});
