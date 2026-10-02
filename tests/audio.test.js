import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { audioKey, audioId } from '../js/core/audiokey.js';
import { collectTexts, ttsText, trSpans, choiceAnswer, phraseSay, buildIndex } from '../scripts/audio.mjs';
import { WORDS } from '../js/data/vocab.js';
import { LESSONS } from '../js/data/curriculum.js';
import { DIALOGUES } from '../js/data/dialogues.js';
import { NUM_SETS, CLOCK_TIMES, numberTr, priceTr, timeTr } from '../js/core/numbers.js';

test('음성 키: 대소문자·부호·띄어쓰기는 무시, 의문문은 구분', () => {
  assert.equal(audioKey('Merhaba!'), 'merhaba');
  assert.equal(audioKey('merhaba'), 'merhaba');
  assert.equal(audioKey('İstanbul\'a  gidiyorum.'), 'istanbula gidiyorum');
  assert.equal(audioKey('IŞIK'), 'ışık');
  assert.equal(audioKey('Nasılsın?'), 'nasılsın?');
  assert.equal(audioKey('"Nasılsın?"'), 'nasılsın?');
  assert.notEqual(audioKey('Geliyor musun?'), audioKey('Geliyor musun.'));
  assert.equal(audioKey('— , .'), '');
  assert.equal(audioId('…'), null);
});

test('음성 파일 이름: 고정 길이, 목소리마다 다름, 항상 같은 값', () => {
  const a = audioId('Merhaba!');
  assert.match(a, /^[0-9a-z]{9}$/);
  assert.equal(a, audioId('merhaba'));
  assert.notEqual(a, audioId('Merhaba!', 'm'));
  assert.equal(audioId('Bir çay, lütfen.'), audioId('bir çay lütfen'));
});

test('합성용 글: 숫자는 글자로, 기호·형태소 하이픈 정리, 문장 부호', () => {
  assert.equal(ttsText('ev'), 'Ev.');
  assert.equal(ttsText('ılık'), 'Ilık.');
  assert.equal(ttsText('iyi'), 'İyi.');
  assert.equal(ttsText('Nasılsın?'), 'Nasılsın?');
  assert.equal(ttsText('3 elma'), 'Üç elma.');
  assert.equal(ttsText('Saat 14:30'), 'Saat on dört otuz.');
  assert.equal(ttsText('kedi → kediler'), 'Kedi, kediler.');
  assert.equal(ttsText('gel-iyor-um'), 'Geliyorum.');
  assert.equal(ttsText('-de / -da'), 'De, da.');
  assert.equal(ttsText('T1 tramvayı'), 'Te bir tramvayı.');
  assert.equal(ttsText('Şey… bilmiyorum'), 'Şey, bilmiyorum.');
});

test('HTML 속 .tr 글자 뽑기 (tapToSpeak와 같은 결과)', () => {
  assert.deepEqual(trSpans('가 <b class="tr">evde</b> 와 <span class="tr">ev<u>ler</u> (çoğul)</span>'), ['evde', 'evler çoğul']);
  assert.deepEqual(trSpans(''), []);
  assert.equal(choiceAnswer({ q: 'Ben ___ .', opts: ['öğrenciyim', 'öğrencisin'], a: 0 }), 'Ben öğrenciyim.');
  assert.equal(choiceAnswer({ q: '어느 쪽?', opts: ['가', '나'], a: 0 }), null);
  assert.equal(phraseSay('Su / Çay … lütfen'), 'Su, Çay  lütfen');
});

test('녹음 목록이 앱의 소리 나는 글을 모두 담는다', () => {
  const items = collectTexts();
  const ids = new Set(items.map((i) => i.id));
  assert.equal(ids.size, items.length, 'id 중복');
  const has = (text, voice = 'f') => ids.has(audioId(text, voice));
  for (const w of WORDS) {
    assert.ok(has(w.tr), `단어 ${w.tr}`);
    if (w.ex) assert.ok(has(w.ex[0]), `예문 ${w.ex[0]}`);
  }
  for (const l of LESSONS) for (const [tr] of l.sents || []) assert.ok(has(tr), `레슨 문장 ${tr}`);
  for (const d of DIALOGUES) {
    for (const r of Object.values(d.roles)) assert.ok(r.voice === 'f' || r.voice === 'm', `${d.id} voice`);
    assert.notEqual(d.roles.A.voice, d.roles.B.voice, `${d.id}: 두 역할은 서로 다른 목소리`);
    for (const [role, tr] of d.lines) assert.ok(has(tr, d.roles[role].voice), `회화 ${d.id}: ${tr}`);
  }
  for (const n of NUM_SETS[3]) assert.ok(has(numberTr(n)), `숫자 ${n}`);
  for (const n of NUM_SETS[5]) assert.ok(has(priceTr(n)), `가격 ${n}`);
  for (const [h, m] of CLOCK_TIMES) assert.ok(has(timeTr(h, m)), `시각 ${h}:${m}`);
  for (const it of items) {
    assert.ok(it.say && /[.?!]$/.test(it.say), `문장 부호: ${it.say}`);
    assert.ok(!/\d/.test(it.say), `숫자가 남음: ${it.say}`);
  }
});

test('숫자 드릴 묶음', () => {
  assert.equal(NUM_SETS[1].length, 21);
  assert.deepEqual([NUM_SETS[2][0], NUM_SETS[2].at(-1)], [21, 100]);
  for (const n of NUM_SETS[3]) assert.ok(n >= 100 && n < 1000);
  for (const n of NUM_SETS[4]) assert.ok(n >= 1000 && n < 100000);
  for (const n of NUM_SETS[5]) assert.ok(n >= 1 && n < 302 && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6);
  assert.equal(new Set(NUM_SETS[4]).size, NUM_SETS[4].length);
  assert.equal(CLOCK_TIMES.length, 144);
});

test('audio/index.json이 실제 파일과 맞고, 대부분의 글에 녹음이 있다', () => {
  assert.ok(existsSync('audio/index.json'), 'audio/index.json 없음 — node scripts/audio.mjs index');
  const index = JSON.parse(readFileSync('audio/index.json', 'utf8'));
  const { ids, missing } = buildIndex();
  assert.deepEqual(index.ids, ids, 'index.json이 오래됨 — node scripts/audio.mjs index');
  let bytes = 0;
  for (const id of index.ids) bytes += statSync(`audio/${id}.mp3`).size;
  assert.equal(index.bytes, bytes);
  const total = ids.length + missing.length;
  assert.ok(ids.length / total >= 0.97, `녹음 ${ids.length}/${total}`);
});
