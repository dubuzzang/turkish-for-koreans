import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noun, copula, conjugate, h2, h4, softens } from '../js/core/morph.js';
import { WORD } from '../js/data/vocab.js';

const W = (id) => WORD.get(id);

test('모음조화 2형·4형', () => {
  assert.equal(h2('ev'), 'e');
  assert.equal(h2('okul'), 'a');
  assert.equal(h4('göz'), 'ü');
  assert.equal(h4('kız'), 'ı');
  assert.equal(h4('saat', true), 'i');
});

test('명사 격어미 — 기본', () => {
  const cases = [
    ['ev', 'pl', 'evler'], ['kitap', 'pl', 'kitaplar'], ['ev', 'loc', 'evde'], ['okul', 'loc', 'okulda'],
    ['kitap', 'loc', 'kitapta'], ['iş', 'loc', 'işte'], ['ev', 'dat', 'eve'], ['araba', 'dat', 'arabaya'],
    ['müze', 'dat', 'müzeye'], ['ev', 'abl', 'evden'], ['sokak', 'abl', 'sokaktan'], ['ev', 'acc', 'evi'],
    ['araba', 'acc', 'arabayı'], ['ev', 'gen', 'evin'], ['araba', 'gen', 'arabanın'], ['otobüs', 'ins', 'otobüsle'],
    ['taksi', 'ins', 'taksiyle'], ['kalem', 'ins', 'kalemle'], ['göz', 'acc', 'gözü'], ['okul', 'acc', 'okulu'],
  ];
  for (const [w, c, exp] of cases) {
    const opts = c === 'pl' ? { pl: true } : { cas: c };
    assert.equal(noun(w, opts).text, exp, `${w}+${c}`);
  }
});

test('자음 연화·모음 탈락·예외 조화', () => {
  assert.equal(noun('kitap', { cas: 'acc' }).text, 'kitabı');
  assert.equal(noun('kitap', { cas: 'dat' }).text, 'kitaba');
  assert.equal(noun('çocuk', { cas: 'acc' }).text, 'çocuğu');
  assert.equal(noun('ağaç', { cas: 'dat' }).text, 'ağaca');
  assert.equal(noun(W('renk'), { cas: 'acc' }).text, 'rengi');
  assert.equal(noun(W('dort'), { cas: 'acc' }).text, 'dördü');
  assert.equal(noun(W('uc'), { cas: 'acc' }).text, 'üçü');
  assert.equal(noun(W('agiz'), { cas: 'acc' }).text, 'ağzı');
  assert.equal(noun(W('agiz'), { cas: 'loc' }).text, 'ağızda');
  assert.equal(noun(W('isim'), { poss: 1 }).text, 'ismim');
  assert.equal(noun(W('sehir'), { cas: 'loc' }).text, 'şehirde');
  assert.equal(noun(W('sehir'), { cas: 'acc' }).text, 'şehri');
  assert.equal(noun(W('saat'), { cas: 'loc' }).text, 'saatte');
  assert.equal(noun(W('saat'), { cas: 'dat' }).text, 'saate');
  assert.equal(noun(W('kalp'), { cas: 'acc' }).text, 'kalbi');
  assert.equal(noun(W('bilet'), { cas: 'acc' }).text, 'bileti');
  assert.equal(noun(W('grip'), { cas: 'acc' }).text, 'gribi');
  assert.equal(softens({ tr: 'park' }), false);
});

test('고유명사는 아포스트로피, 연화 없음', () => {
  assert.equal(noun(W('istanbul'), { cas: 'loc' }).text, "İstanbul'da");
  assert.equal(noun(W('kore'), { cas: 'abl' }).text, "Kore'den");
  assert.equal(noun(W('kore'), { cas: 'dat' }).text, "Kore'ye");
  assert.equal(noun(W('seul'), { cas: 'loc' }).text, "Seul'de");
  assert.equal(noun(W('turkiye'), { cas: 'gen' }).text, "Türkiye'nin");
  assert.equal(noun({ tr: 'Ali', proper: true }, { cas: 'gen' }).text, "Ali'nin");
  assert.equal(noun(W('ankara'), { cas: 'dat' }).text, "Ankara'ya");
});

test('소유 접미사와 그 뒤 격어미', () => {
  const ev = ['evim', 'evin', 'evi', 'evimiz', 'eviniz', 'evleri'];
  const araba = ['arabam', 'araban', 'arabası', 'arabamız', 'arabanız', 'arabaları'];
  for (let p = 1; p <= 6; p++) {
    assert.equal(noun('ev', { poss: p }).text, ev[p - 1]);
    assert.equal(noun('araba', { poss: p }).text, araba[p - 1]);
  }
  assert.equal(noun('kitap', { poss: 1 }).text, 'kitabım');
  assert.equal(noun('ev', { poss: 3, cas: 'loc' }).text, 'evinde');
  assert.equal(noun('ev', { poss: 3, cas: 'acc' }).text, 'evini');
  assert.equal(noun('araba', { poss: 3, cas: 'dat' }).text, 'arabasına');
  assert.equal(noun('ev', { poss: 1, cas: 'loc' }).text, 'evimde');
  assert.equal(noun('ev', { pl: true, poss: 1 }).text, 'evlerim');
  assert.equal(noun('ev', { pl: true, cas: 'loc' }).text, 'evlerde');
  assert.equal(noun('kitap', { pl: true, cas: 'acc' }).text, 'kitapları');
  assert.equal(noun('ev', { pl: true, poss: 6 }).text, 'evleri');
});

test('~이다 (서술 접미사)', () => {
  const ogr = ['öğrenciyim', 'öğrencisin', 'öğrenci', 'öğrenciyiz', 'öğrencisiniz', 'öğrenciler'];
  const dok = ['doktorum', 'doktorsun', 'doktor', 'doktoruz', 'doktorsunuz', 'doktorlar'];
  for (let p = 1; p <= 6; p++) {
    assert.equal(copula('öğrenci', p).text, ogr[p - 1]);
    assert.equal(copula('doktor', p).text, dok[p - 1]);
  }
  assert.equal(copula(W('cocuk'), 1).text, 'çocuğum');
  assert.equal(copula(W('ac'), 1).text, 'açım');
  assert.equal(copula(W('turk'), 1).text, 'Türküm');
  assert.equal(copula(W('mesgul'), 1).text, 'meşgulüm');
  assert.equal(copula('öğrenci', 1, { neg: true }).text, 'öğrenci değilim');
  assert.equal(copula('öğrenci', 3, { neg: true }).text, 'öğrenci değil');
  assert.equal(copula('Türk', 2, { q: true }).text, 'Türk müsün');
  assert.equal(copula('Koreli', 5, { q: true }).text, 'Koreli misiniz');
  assert.equal(copula('hasta', 1, { q: true }).text, 'hasta mıyım');
  assert.equal(copula('öğrenci', 6, { q: true }).text, 'öğrenciler mi');
  assert.equal(copula('öğrenci', 1, { past: true }).text, 'öğrenciydim');
  assert.equal(copula('doktor', 1, { past: true }).text, 'doktordum');
  assert.equal(copula('Türk', 1, { past: true }).text, 'Türktüm');
  assert.equal(copula('evde', 4, { past: true }).text, 'evdeydik');
  assert.equal(copula('öğrenci', 2, { past: true, q: true }).text, 'öğrenci miydin');
  assert.equal(copula('öğrenci', 1, { past: true, neg: true }).text, 'öğrenci değildim');
});

const T = (inf, tense, forms, opts) => {
  forms.forEach((exp, i) => {
    if (exp == null) return;
    assert.equal(conjugate(inf, tense, i + 1, opts).text, exp, `${inf} ${tense} ${i + 1} ${JSON.stringify(opts || {})}`);
  });
};

test('현재진행 -iyor', () => {
  T('gelmek', 'prog', ['geliyorum', 'geliyorsun', 'geliyor', 'geliyoruz', 'geliyorsunuz', 'geliyorlar']);
  T('gitmek', 'prog', ['gidiyorum', 'gidiyorsun', 'gidiyor', 'gidiyoruz', 'gidiyorsunuz', 'gidiyorlar']);
  T('okumak', 'prog', ['okuyorum', null, 'okuyor', null, null, 'okuyorlar']);
  T('başlamak', 'prog', [null, 'başlıyorsun', 'başlıyor']);
  T('beklemek', 'prog', ['bekliyorum']);
  T('oynamak', 'prog', [null, null, 'oynuyor']);
  T('söylemek', 'prog', [null, null, 'söylüyor']);
  T('yemek', 'prog', ['yiyorum', null, 'yiyor']);
  T('demek', 'prog', ['diyorum', null, 'diyor']);
  T('görmek', 'prog', ['görüyorum']);
  T('gelmek', 'prog', ['gelmiyorum', null, 'gelmiyor'], { neg: true });
  T('almak', 'prog', ['almıyorum'], { neg: true });
  T('okumak', 'prog', [null, null, 'okumuyor'], { neg: true });
  T('gelmek', 'prog', ['geliyor muyum', 'geliyor musun', 'geliyor mu', 'geliyor muyuz', 'geliyor musunuz', 'geliyorlar mı'], { q: true });
  T('yardım etmek', 'prog', ['yardım ediyorum']);
  T('kahvaltı etmek', 'prog', [null, null, 'kahvaltı ediyor']);
});

test('과거 -dı', () => {
  T('gelmek', 'past', ['geldim', 'geldin', 'geldi', 'geldik', 'geldiniz', 'geldiler']);
  T('gitmek', 'past', ['gittim', null, 'gitti']);
  T('yapmak', 'past', ['yaptım', null, null, 'yaptık']);
  T('okumak', 'past', ['okudum', null, null, null, 'okudunuz', 'okudular']);
  T('içmek', 'past', ['içtim']);
  T('görmek', 'past', [null, 'gördün']);
  T('gelmek', 'past', ['gelmedim', null, 'gelmedi'], { neg: true });
  T('almak', 'past', ['almadım'], { neg: true });
  T('gelmek', 'past', ['geldim mi', 'geldin mi', 'geldi mi', 'geldik mi', 'geldiniz mi', 'geldiler mi'], { q: true });
});

test('미래 -ecek', () => {
  T('gelmek', 'fut', ['geleceğim', 'geleceksin', 'gelecek', 'geleceğiz', 'geleceksiniz', 'gelecekler']);
  T('gitmek', 'fut', ['gideceğim']);
  T('okumak', 'fut', ['okuyacağım', null, 'okuyacak']);
  T('başlamak', 'fut', [null, null, null, 'başlayacağız']);
  T('yemek', 'fut', ['yiyeceğim']);
  T('demek', 'fut', [null, null, 'diyecek']);
  T('gelmek', 'fut', ['gelmeyeceğim'], { neg: true });
  T('almak', 'fut', [null, null, 'almayacak'], { neg: true });
  T('gelmek', 'fut', ['gelecek miyim', null, 'gelecek mi', null, null, 'gelecekler mi'], { q: true });
});

test('광범위 -ir/-er', () => {
  T('gelmek', 'aor', ['gelirim', 'gelirsin', 'gelir', 'geliriz', 'gelirsiniz', 'gelirler']);
  T('gitmek', 'aor', ['giderim', null, 'gider']);
  T('yapmak', 'aor', [null, null, 'yapar']);
  T('okumak', 'aor', [null, null, 'okur']);
  T('konuşmak', 'aor', [null, null, 'konuşur']);
  T('almak', 'aor', [null, null, 'alır']);
  T('görmek', 'aor', [null, null, 'görür']);
  T('yemek', 'aor', [null, null, 'yer']);
  T('etmek', 'aor', [null, null, 'eder']);
  T('kaybetmek', 'aor', [null, null, 'kaybeder']);
  T('öğrenmek', 'aor', [null, null, 'öğrenir']);
  T('gelmek', 'aor', ['gelmem', 'gelmezsin', 'gelmez', 'gelmeyiz', 'gelmezsiniz', 'gelmezler'], { neg: true });
  T('yapmak', 'aor', ['yapmam', null, null, 'yapmayız'], { neg: true });
  T('gelmek', 'aor', [null, 'gelir misin', 'gelir mi'], { q: true });
  T('gelmek', 'aor', ['gelmez miyim', null, null, null, null, 'gelmezler mi'], { neg: true, q: true });
});

test('기타 법·시제', () => {
  T('gelmek', 'evid', ['gelmişim', 'gelmişsin', 'gelmiş', 'gelmişiz', 'gelmişsiniz', 'gelmişler']);
  T('okumak', 'evid', [null, null, 'okumuş']);
  T('gelmek', 'evid', [null, null, 'gelmemiş'], { neg: true });
  T('gelmek', 'nec', ['gelmeliyim', 'gelmelisin', 'gelmeli', 'gelmeliyiz', 'gelmelisiniz', 'gelmeliler']);
  T('yapmak', 'nec', ['yapmalıyım']);
  T('gelmek', 'nec', [null, null, 'gelmemeli'], { neg: true });
  T('gelmek', 'abil', ['gelebilirim', 'gelebilirsin', 'gelebilir', 'gelebiliriz', 'gelebilirsiniz', 'gelebilirler']);
  T('okumak', 'abil', ['okuyabilirim']);
  T('gitmek', 'abil', [null, null, 'gidebilir']);
  T('yemek', 'abil', [null, null, 'yiyebilir']);
  T('gelmek', 'abil', ['gelemem', 'gelemezsin', 'gelemez', 'gelemeyiz', 'gelemezsiniz', 'gelemezler'], { neg: true });
  T('okumak', 'abil', ['okuyamam'], { neg: true });
  T('yapmak', 'abil', [null, null, null, 'yapamayız'], { neg: true });
  T('yapmak', 'abil', [null, null, null, null, 'yapabilir misiniz'], { q: true });
  T('gelmek', 'cond', ['gelsem', 'gelsen', 'gelse', 'gelsek', 'gelseniz', 'gelseler']);
  T('okumak', 'cond', ['okusam']);
  T('gelmek', 'cond', ['gelmesem'], { neg: true });
  assert.equal(conjugate('gelmek', 'opt', 4).text, 'gelelim');
  assert.equal(conjugate('gitmek', 'opt', 4).text, 'gidelim');
  assert.equal(conjugate('okumak', 'opt', 4).text, 'okuyalım');
  assert.equal(conjugate('yemek', 'opt', 4).text, 'yiyelim');
  assert.equal(conjugate('gelmek', 'opt', 1).text, 'geleyim');
  assert.equal(conjugate('okumak', 'opt', 1).text, 'okuyayım');
  assert.equal(conjugate('gelmek', 'opt', 4, { neg: true }).text, 'gelmeyelim');
  assert.equal(conjugate('gitmek', 'opt', 4, { q: true }).text, 'gidelim mi');
  assert.equal(conjugate('gelmek', 'imp', 2).text, 'gel');
  assert.equal(conjugate('gelmek', 'imp', 2, { neg: true }).text, 'gelme');
  assert.equal(conjugate('gelmek', 'imp', 3).text, 'gelsin');
  assert.equal(conjugate('gelmek', 'imp', 5).text, 'gelin');
  assert.equal(conjugate('gitmek', 'imp', 5).text, 'gidin');
  assert.equal(conjugate('okumak', 'imp', 5).text, 'okuyun');
  assert.equal(conjugate('yemek', 'imp', 5).text, 'yiyin');
  assert.equal(conjugate('demek', 'imp', 5).text, 'deyin');
  assert.equal(conjugate('yapmak', 'imp', 5, { neg: true }).text, 'yapmayın');
  assert.equal(conjugate('gelmek', 'imp', 6).text, 'gelsinler');
  assert.equal(conjugate('yardım etmek', 'imp', 5).text, 'yardım edin');
  T('gelmek', 'pastProg', ['geliyordum', 'geliyordun', 'geliyordu', 'geliyorduk', 'geliyordunuz', 'geliyorlardı']);
  T('gelmek', 'pastProg', ['gelmiyordum'], { neg: true });
  T('gelmek', 'want', ['gelmek istiyorum', null, 'gelmek istiyor']);
  T('gelmek', 'want', ['gelmek istemiyorum'], { neg: true });
  T('yardım etmek', 'want', ['yardım etmek istiyorum']);
});

test('모든 동사가 모든 시제에서 오류 없이 활용된다', async () => {
  const { WORDS } = await import('../js/data/vocab.js');
  const verbs = WORDS.filter((w) => w.pos === 'v');
  for (const v of verbs) {
    for (const tense of ['prog', 'past', 'fut', 'aor', 'evid', 'nec', 'abil', 'cond', 'pastProg', 'want']) {
      for (let p = 1; p <= 6; p++) {
        for (const opts of [{}, { neg: true }, { q: true }]) {
          const r = conjugate(v.tr, tense, p, opts);
          assert.ok(r.text && !/undefined|null/.test(r.text), `${v.tr} ${tense} ${p}`);
        }
      }
    }
  }
});
