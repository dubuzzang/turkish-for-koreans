import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numberTr, ordinalTr, priceTr, timeTr, timeAtTr, timeDigitalTr } from '../js/core/numbers.js';

test('기수', () => {
  const C = {
    0: 'sıfır', 1: 'bir', 7: 'yedi', 10: 'on', 11: 'on bir', 19: 'on dokuz', 20: 'yirmi', 25: 'yirmi beş',
    48: 'kırk sekiz', 99: 'doksan dokuz', 100: 'yüz', 101: 'yüz bir', 200: 'iki yüz', 234: 'iki yüz otuz dört',
    1000: 'bin', 1001: 'bin bir', 1100: 'bin yüz', 2026: 'iki bin yirmi altı', 3456: 'üç bin dört yüz elli altı',
    10000: 'on bin', 100000: 'yüz bin', 1000000: 'bir milyon', 15600000: 'on beş milyon altı yüz bin',
    8000000000: 'sekiz milyar',
  };
  for (const [n, w] of Object.entries(C)) assert.equal(numberTr(Number(n)), w, n);
});

test('서수', () => {
  const C = { 1: 'birinci', 2: 'ikinci', 3: 'üçüncü', 4: 'dördüncü', 5: 'beşinci', 6: 'altıncı', 7: 'yedinci', 8: 'sekizinci', 9: 'dokuzuncu', 10: 'onuncu', 20: 'yirminci', 40: 'kırkıncı', 60: 'altmışıncı', 100: 'yüzüncü', 1000: 'bininci', 21: 'yirmi birinci' };
  for (const [n, w] of Object.entries(C)) assert.equal(ordinalTr(Number(n)), w, n);
});

test('가격', () => {
  assert.equal(priceTr(45.5), 'kırk beş lira elli kuruş');
  assert.equal(priceTr(100), 'yüz lira');
  assert.equal(priceTr(0.75), 'yetmiş beş kuruş');
  assert.equal(priceTr(1250.25), 'bin iki yüz elli lira yirmi beş kuruş');
});

test('시각', () => {
  assert.equal(timeTr(3, 0), 'Saat üç.');
  assert.equal(timeTr(15, 0), 'Saat üç.');
  assert.equal(timeTr(3, 30), 'Saat üç buçuk.');
  assert.equal(timeTr(12, 30), 'Saat on iki buçuk.');
  assert.equal(timeTr(3, 15), 'Saat üçü çeyrek geçiyor.');
  assert.equal(timeTr(4, 10), 'Saat dördü on geçiyor.');
  assert.equal(timeTr(6, 20), 'Saat altıyı yirmi geçiyor.');
  assert.equal(timeTr(3, 45), 'Saat dörde çeyrek var.');
  assert.equal(timeTr(5, 50), 'Saat altıya on var.');
  assert.equal(timeTr(12, 40), 'Saat bire yirmi var.');
  assert.equal(timeTr(11, 55), 'Saat on ikiye beş var.');
  assert.equal(timeAtTr(3, 0), 'Saat üçte.');
  assert.equal(timeAtTr(4, 0), 'Saat dörtte.');
  assert.equal(timeAtTr(3, 30), 'Saat üç buçukta.');
  assert.equal(timeAtTr(3, 15), 'Saat üçü çeyrek geçe.');
  assert.equal(timeAtTr(3, 45), 'Saat dörde çeyrek kala.');
  assert.equal(timeDigitalTr(15, 45), 'on beş kırk beş');
  assert.equal(timeDigitalTr(9, 5), 'dokuz sıfır beş');
});
