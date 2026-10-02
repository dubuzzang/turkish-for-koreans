import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toHangul } from '../js/core/hangul.js';

const CASES = {
  merhaba: '메르하바',
  günaydın: '귀나이든',
  teşekkür: '테셱퀴르',
  ederim: '에데림',
  nasılsın: '나슬슨',
  evet: '에벳',
  hayır: '하이으르',
  lütfen: '뤼트펜',
  güle: '귈레',
  Türkiye: '튀르키예',
  İstanbul: '이스탄불',
  Ankara: '앙카라',
  çay: '차이',
  kahve: '카흐베',
  ekmek: '에크멕',
  su: '수',
  değil: '데일',
  yağmur: '야무르',
  öğretmen: '외레트멘',
  öğrenci: '외렌지',
  Türk: '튀르크',
  renk: '렝크',
  tamam: '타맘',
  kebap: '케밥',
  baklava: '바클라바',
  tatlı: '타틀르',
  iyi: '이이',
  dört: '되르트',
  altı: '알트',
  kalem: '칼렘',
  anne: '안네',
  elli: '엘리',
  Kore: '코레',
  otobüs: '오토뷔스',
  simit: '시밋',
  şeker: '셰케르',
  yıl: '이을',
  kız: '크즈',
  affedersiniz: '아페데르시니즈',
  tren: '트렌',
  plan: '플란',
  saat: '사앗',
  aile: '아일레',
  soğuk: '소욱',
  dağ: '다',
  ağustos: '아우스토스',
};

test('단어를 한글 발음으로 옮긴다', () => {
  for (const [tr, ko] of Object.entries(CASES)) {
    assert.equal(toHangul(tr), ko, tr);
  }
});

test('문장의 구두점과 공백은 유지한다', () => {
  assert.equal(toHangul('Merhaba, nasılsın?'), '메르하바, 나슬슨?');
  assert.equal(toHangul('Güle güle!'), '귈레 귈레!');
  assert.equal(toHangul("İstanbul'da"), '이스탄불다');
});

test('빈 문자열·숫자 처리', () => {
  assert.equal(toHangul(''), '');
  assert.equal(toHangul('3 lira'), '3 리라');
});
