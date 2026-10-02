// 튀르키예어 형태소 엔진: 모음조화 · 자음 규칙 · 명사 곡용 · 서술 접미사 · 동사 활용
// 모든 함수는 { text, parts:[{t,k}] } 를 돌려준다. k: stem pl poss case buf apos cop pers neg tense q
import { trLower } from './tr.js';

const VOW = 'aeıioöuü';
const BACK = 'aıou';
export const VOICELESS = 'çfhkpsşt';
const isV = (c) => VOW.includes(c);
const FRONT_OF = { a: 'e', ı: 'i', o: 'ö', u: 'ü' };
const H4 = { a: 'ı', ı: 'ı', o: 'u', u: 'u', e: 'i', i: 'i', ö: 'ü', ü: 'ü' };

function lastVowel(word) {
  const s = trLower(word);
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s[i];
    if (isV(c)) return c;
    if (c === 'â') return 'a';
    if (c === 'î') return 'i';
    if (c === 'û') return 'u';
  }
  return 'e';
}
export function harmonyVowel(word, front = false) {
  const v = lastVowel(word);
  return front && FRONT_OF[v] ? FRONT_OF[v] : v;
}
/** 2형 모음조화: a / e */
export const h2 = (word, front = false) => (BACK.includes(harmonyVowel(word, front)) ? 'a' : 'e');
/** 4형 모음조화: ı / i / u / ü */
export const h4 = (word, front = false) => H4[harmonyVowel(word, front)];
export const endsVowel = (w) => isV(trLower(w).slice(-1));
export const endsVoiceless = (w) => VOICELESS.includes(trLower(w).slice(-1));
export const vowelCount = (w) => [...trLower(w)].filter(isV).length;
const join = (parts) => parts.map((p) => p.t).join('');
const result = (parts) => ({ text: join(parts), parts });

// ---------- 자음 연화 · 모음 탈락 ----------
export function softens(n) {
  if (n.soft !== undefined) return n.soft;
  if (n.proper) return false;
  const s = trLower(n.tr);
  const last = s.slice(-1);
  if (!'pçk'.includes(last)) return false;
  if (s.endsWith('nk')) return true;
  return vowelCount(s) > 1;
}
export function soften(stem) {
  const last = stem.slice(-1);
  if (last === 'k' && stem.slice(-2, -1) === 'n') return `${stem.slice(0, -1)}g`;
  const map = { p: 'b', ç: 'c', t: 'd', k: 'ğ' };
  return map[last] ? stem.slice(0, -1) + map[last] : stem;
}
export function dropVowel(stem) {
  for (let i = stem.length - 1; i >= 0; i--) {
    if (isV(stem[i])) return stem.slice(0, i) + stem.slice(i + 1);
  }
  return stem;
}

// ---------- 명사 ----------
export const CASES = ['nom', 'acc', 'dat', 'loc', 'abl', 'gen', 'ins'];
export const CASE_KO = {
  nom: { name: '기본형', ko: '' },
  acc: { name: '목적격', ko: '을/를' },
  dat: { name: '여격', ko: '에/에게/(으)로' },
  loc: { name: '장소격', ko: '에/에서' },
  abl: { name: '탈격', ko: '에서/부터/보다' },
  gen: { name: '속격', ko: '의' },
  ins: { name: '도구격', ko: '와/과, (으)로' },
};
export const PERSONS = ['', 'ben', 'sen', 'o', 'biz', 'siz', 'onlar'];
export const PERSON_KO = ['', '나', '너', '그', '우리', '당신/너희', '그들'];
export const POSS_KO = ['', '나의', '너의', '그의', '우리의', '당신의', '그들의'];

const asNoun = (w) => (typeof w === 'string' ? { tr: w } : w);

/**
 * 명사 곡용. opts: { pl, poss(1-6), cas }
 * 예) noun('kitap', {cas:'acc'}) → kitabı / noun({tr:'İstanbul',proper:true},{cas:'loc'}) → İstanbul'da
 */
export function noun(word, { pl = false, poss = 0, cas = 'nom' } = {}) {
  const w = asNoun(word);
  const parts = [{ t: w.tr, k: 'stem' }];
  let bare = true;
  const front = !!w.front;
  const cur = () => join(parts);
  const firstSuffix = () => {
    if (w.proper && bare) parts.push({ t: "'", k: 'apos' });
  };
  // 모음으로 시작하는 접미사가 맨몸 어간에 붙을 때: 모음 탈락 / 자음 연화
  const vowelInitial = () => {
    if (!bare || w.proper) return;
    if (w.drop) parts[0].t = dropVowel(parts[0].t);
    else if (softens(w)) parts[0].t = soften(parts[0].t);
  };
  const add = (t, k) => { if (t) parts.push({ t, k }); };
  const vowelSuffix = (buf, body, k) => {
    // buf: 모음 뒤 연결음(y/n/s), body: 모음으로 시작하는 접미사
    firstSuffix();
    if (endsVowel(cur().replace("'", ''))) add(buf, 'buf');
    else vowelInitial();
    add(body, k);
    bare = false;
  };
  const hv4 = () => h4(cur().replace("'", ''), bare && front);
  const hv2 = () => h2(cur().replace("'", ''), bare && front);

  if (pl) {
    const v = hv2();
    firstSuffix();
    add(`l${v}r`, 'pl');
    bare = false;
  }
  let poss3 = false;
  if (poss) {
    if (poss === 6 && pl) {
      vowelSuffix('', hv4(), 'poss');
      poss3 = true;
    } else {
      const v4 = hv4();
      const v2 = hv2();
      const V = endsVowel(cur().replace("'", ''));
      if (poss === 1) V ? (firstSuffix(), add('m', 'poss'), (bare = false)) : vowelSuffix('', `${v4}m`, 'poss');
      if (poss === 2) V ? (firstSuffix(), add('n', 'poss'), (bare = false)) : vowelSuffix('', `${v4}n`, 'poss');
      if (poss === 3) { vowelSuffix('s', v4, 'poss'); poss3 = true; }
      if (poss === 4) V ? (firstSuffix(), add(`m${v4}z`, 'poss'), (bare = false)) : vowelSuffix('', `${v4}m${v4}z`, 'poss');
      if (poss === 5) V ? (firstSuffix(), add(`n${v4}z`, 'poss'), (bare = false)) : vowelSuffix('', `${v4}n${v4}z`, 'poss');
      if (poss === 6) {
        firstSuffix();
        const lv = `l${v2}r`;
        add(`${lv}${h4(lv)}`, 'poss');
        bare = false;
        poss3 = true;
      }
    }
  }
  if (cas && cas !== 'nom') {
    const base = cur().replace("'", '');
    const V = endsVowel(base);
    const v4 = hv4();
    const v2 = hv2();
    if (poss3) {
      // 3인칭 소유 뒤에는 대명사적 n
      const map = { acc: v4, dat: v2, loc: `d${v2}`, abl: `d${v2}n`, gen: `${v4}n` };
      if (cas === 'ins') { add('y', 'buf'); add(`l${v2}`, 'case'); }
      else { add('n', 'buf'); add(map[cas], 'case'); }
    } else if (cas === 'acc') vowelSuffix('y', v4, 'case');
    else if (cas === 'dat') vowelSuffix('y', v2, 'case');
    else if (cas === 'gen') vowelSuffix('n', `${v4}n`, 'case');
    else if (cas === 'loc' || cas === 'abl') {
      const d = endsVoiceless(base) ? 't' : 'd';
      firstSuffix();
      add(`${d}${v2}${cas === 'abl' ? 'n' : ''}`, 'case');
      bare = false;
    } else if (cas === 'ins') {
      firstSuffix();
      if (V) add('y', 'buf');
      add(`l${v2}`, 'case');
      bare = false;
    }
  }
  return result(parts);
}

// ---------- 서술 접미사 (~이다) ----------
function persZParts(word, p) {
  const v4 = h4(word), v2 = h2(word), V = endsVowel(word);
  const P = [];
  if (p === 1) { if (V) P.push({ t: 'y', k: 'buf' }); P.push({ t: `${v4}m`, k: 'pers' }); }
  if (p === 2) P.push({ t: `s${v4}n`, k: 'pers' });
  if (p === 4) { if (V) P.push({ t: 'y', k: 'buf' }); P.push({ t: `${v4}z`, k: 'pers' }); }
  if (p === 5) P.push({ t: `s${v4}n${v4}z`, k: 'pers' });
  if (p === 6) P.push({ t: `l${v2}r`, k: 'pers' });
  return P;
}
function persKParts(word, p) {
  const v4 = h4(word), v2 = h2(word);
  return [{ t: ['', 'm', 'n', '', 'k', `n${v4}z`, `l${v2}r`][p], k: 'pers' }].filter((x) => x.t);
}

/**
 * 명사·형용사 + ~이다. opts: { neg, q, past }
 * öğrenci → öğrenciyim, doktor musun?, öğrenci değilim, öğrenciydim
 */
export function copula(word, p, { neg = false, q = false, past = false } = {}) {
  const w = asNoun(word);
  const stem = w.tr;
  if (neg) {
    const parts = [{ t: stem, k: 'stem' }, { t: ' değil', k: 'neg' }];
    if (past) return result([...parts, { t: 'di', k: 'cop' }, ...persKParts('değildi', p), ...(q ? [{ t: ` m${h4('değildi')}`, k: 'q' }] : [])]);
    if (q) {
      if (p === 6) return result([...parts, { t: 'ler', k: 'pers' }, { t: ' mi', k: 'q' }]);
      return result([...parts, { t: ' mi', k: 'q' }, ...persZParts('mi', p)]);
    }
    return result([...parts, ...persZParts('değil', p)]);
  }
  if (past) {
    const parts = [{ t: stem, k: 'stem' }];
    if (w.proper) parts.push({ t: "'", k: 'apos' });
    if (q) {
      const qp = `m${h4(stem)}`;
      return result([...parts, { t: ` ${qp}`, k: 'q' }, { t: 'y', k: 'buf' }, { t: `d${h4(qp)}`, k: 'cop' }, ...persKParts(`${qp}yd${h4(qp)}`, p)]);
    }
    if (endsVowel(stem)) parts.push({ t: 'y', k: 'buf' });
    const d = endsVoiceless(stem) ? 't' : 'd';
    parts.push({ t: `${d}${h4(stem, w.front)}`, k: 'cop' });
    return result([...parts, ...persKParts(join(parts), p)]);
  }
  if (q) {
    const base = [{ t: stem, k: 'stem' }];
    if (p === 6) {
      const pl = `l${h2(stem, w.front)}r`;
      return result([...base, { t: pl, k: 'pers' }, { t: ` m${h4(pl)}`, k: 'q' }]);
    }
    const qp = `m${h4(stem, w.front)}`;
    return result([...base, { t: ` ${qp}`, k: 'q' }, ...persZParts(qp, p)]);
  }
  // 긍정 현재: 모음 접미사 앞 자음 연화(çocuğum)
  let s = stem;
  const vowelStart = (p === 1 || p === 4) && !endsVowel(stem);
  if (vowelStart && !w.proper && softens(w)) s = soften(stem);
  const parts = [{ t: s, k: 'stem' }];
  if (p === 3) return result(parts);
  if (w.proper && p !== 3) parts.push({ t: "'", k: 'apos' });
  const P = persZParts(stem, p).map((x) => (x.k === 'pers' && w.front ? { ...x, t: x.t.replace(/[ıu]/g, (c) => ({ ı: 'i', u: 'ü' }[c])).replace(/a/g, 'e') } : x));
  return result([...parts, ...P]);
}

// ---------- 동사 ----------
const AOR_IR = new Set(['al', 'bil', 'bul', 'dur', 'gel', 'gör', 'kal', 'ol', 'öl', 'san', 'var', 'ver', 'vur']);
const SOFT_VERBS = new Set(['git', 'et', 'tat', 'güt', 'kaybet', 'affet', 'hisset', 'seyret', 'zannet', 'reddet', 'emret', 'sabret', 'keşfet', 'hapset', 'hallet']);
const ET_DERIVED = new Set(['kaybet', 'affet', 'hisset', 'seyret', 'zannet', 'reddet', 'emret', 'sabret', 'keşfet', 'hapset', 'hallet']);

export function verbStem(inf) {
  const s = trLower(String(inf).trim());
  const words = s.split(/\s+/);
  const last = words.pop();
  return { prefix: words.join(' '), stem: last.replace(/m[ae]k$/, '') };
}
const softV = (s) => (SOFT_VERBS.has(s) ? `${s.slice(0, -1)}d` : s);
const isYeDe = (s) => s === 'ye' || s === 'de';

export const TENSES = {
  prog: { name: '현재진행', tr: '-iyor', ko: '-고 있다 / -는다', ex: 'geliyorum 오고 있어요' },
  past: { name: '과거', tr: '-dı', ko: '-았/었다', ex: 'geldim 왔어요' },
  fut: { name: '미래', tr: '-ecek', ko: '-(으)ㄹ 것이다', ex: 'geleceğim 올 거예요' },
  aor: { name: '광범위', tr: '-ir', ko: '-는다(습관·성향), -(으)ㄹ게', ex: 'gelirim 와요/올게요' },
  evid: { name: '전언 과거', tr: '-miş', ko: '-았대요 / -았더라고요', ex: 'gelmiş 왔대요' },
  nec: { name: '의무', tr: '-meli', ko: '-아야 한다', ex: 'gelmeliyim 와야 해요' },
  abil: { name: '가능', tr: '-ebilir', ko: '-(으)ㄹ 수 있다', ex: 'gelebilirim 올 수 있어요' },
  cond: { name: '조건', tr: '-se', ko: '-(으)면', ex: 'gelsem 내가 오면' },
  opt: { name: '청유', tr: '-elim', ko: '-자 / -(으)ㄹ게', ex: 'gelelim 오자' },
  imp: { name: '명령', tr: '-∅ / -in', ko: '-아라 / -(으)세요', ex: 'gel! 와! / gelin! 오세요!' },
  pastProg: { name: '과거진행', tr: '-iyordu', ko: '-고 있었다', ex: 'geliyordum 오고 있었어요' },
  want: { name: '희망', tr: '-mek istiyor', ko: '-고 싶다', ex: 'gelmek istiyorum 오고 싶어요' },
};

function progCore(stem, neg) {
  if (neg) return [{ t: stem, k: 'stem' }, { t: `m${h4(stem)}`, k: 'neg' }, { t: 'yor', k: 'tense' }];
  if (isYeDe(stem)) return [{ t: `${stem[0]}i`, k: 'stem' }, { t: 'yor', k: 'tense' }];
  const s = softV(stem);
  if (endsVowel(s)) {
    const last = s.slice(-1);
    if (last === 'a' || last === 'e') {
      const b = s.slice(0, -1);
      return [{ t: b, k: 'stem' }, { t: `${h4(b)}yor`, k: 'tense' }];
    }
    return [{ t: s, k: 'stem' }, { t: 'yor', k: 'tense' }];
  }
  return [{ t: s, k: 'stem' }, { t: `${h4(s)}yor`, k: 'tense' }];
}

/** z형(인칭어미가 의문 첨사 뒤로 가는) 시제 마무리 */
function zFinish(core, p, q) {
  const word = join(core);
  if (!q) return [...core, ...persZParts(word, p)];
  if (p === 6) {
    const pl = `l${h2(word)}r`;
    return [...core, { t: pl, k: 'pers' }, { t: ` m${h4(pl)}`, k: 'q' }];
  }
  const qp = `m${h4(word)}`;
  return [...core, { t: ` ${qp}`, k: 'q' }, ...persZParts(qp, p)];
}
/** k형(-dı, -se) 마무리: 인칭어미 뒤에 의문 첨사 */
function kFinish(core, p, q) {
  const parts = [...core, ...persKParts(join(core), p)];
  if (q) parts.push({ t: ` m${h4(join(parts))}`, k: 'q' });
  return parts;
}
const negPart = (stem) => ({ t: `m${h2(stem)}`, k: 'neg' });

/**
 * 동사 활용. tense: prog past fut aor evid nec abil cond opt imp pastProg want
 * p: 1~6 (ben sen o biz siz onlar), opts: { neg, q }
 */
export function conjugate(inf, tense, p, { neg = false, q = false } = {}) {
  const { prefix, stem } = verbStem(inf);
  let parts;
  switch (tense) {
    case 'prog':
      parts = zFinish(progCore(stem, neg), p, q);
      break;
    case 'pastProg': {
      const core = progCore(stem, neg);
      if (p === 6) parts = [...core, { t: 'lardı', k: 'pers' }];
      else parts = [...core, { t: 'du', k: 'tense' }, ...persKParts('du', p)];
      if (q) parts.push({ t: ` m${h4(join(parts))}`, k: 'q' });
      break;
    }
    case 'past': {
      const core = [{ t: stem, k: 'stem' }];
      if (neg) core.push(negPart(stem));
      const w = join(core);
      core.push({ t: `${endsVoiceless(w) ? 't' : 'd'}${h4(w)}`, k: 'tense' });
      parts = kFinish(core, p, q);
      break;
    }
    case 'cond': {
      const core = [{ t: stem, k: 'stem' }];
      if (neg) core.push(negPart(stem));
      core.push({ t: `s${h2(join(core))}`, k: 'tense' });
      parts = kFinish(core, p, q);
      break;
    }
    case 'fut': {
      const core = [];
      if (neg) core.push({ t: stem, k: 'stem' }, negPart(stem));
      else core.push({ t: isYeDe(stem) ? `${stem[0]}i` : softV(stem), k: 'stem' });
      const w = join(core);
      if (endsVowel(w)) core.push({ t: 'y', k: 'buf' });
      const ek = h2(w) === 'e' ? 'ecek' : 'acak';
      if (q) { parts = zFinish([...core, { t: ek, k: 'tense' }], p, true); break; }
      if (p === 1 || p === 4) {
        const v = ek === 'ecek' ? 'i' : 'ı';
        parts = [...core, { t: `${ek.slice(0, -1)}ğ`, k: 'tense' }, { t: p === 1 ? `${v}m` : `${v}z`, k: 'pers' }];
      } else parts = [...core, { t: ek, k: 'tense' }, ...persZParts(ek, p)];
      break;
    }
    case 'aor': {
      if (neg) {
        const core = [{ t: stem, k: 'stem' }, negPart(stem)];
        const z = `m${h2(stem)}z`;
        if (q) { parts = zFinish([...core, { t: 'z', k: 'tense' }], p, true); break; }
        if (p === 1) parts = [...core, { t: 'm', k: 'pers' }];
        else if (p === 4) parts = [...core, { t: 'y', k: 'buf' }, { t: `${h4(z)}z`, k: 'pers' }];
        else parts = [...core, { t: 'z', k: 'tense' }, ...persZParts(z, p)];
        break;
      }
      let core;
      if (isYeDe(stem) || endsVowel(stem)) core = [{ t: stem, k: 'stem' }, { t: 'r', k: 'tense' }];
      else if (ET_DERIVED.has(stem)) core = [{ t: softV(stem), k: 'stem' }, { t: 'er', k: 'tense' }];
      else if (vowelCount(stem) === 1 && !AOR_IR.has(stem)) core = [{ t: softV(stem), k: 'stem' }, { t: `${h2(stem)}r`, k: 'tense' }];
      else core = [{ t: softV(stem), k: 'stem' }, { t: `${h4(stem)}r`, k: 'tense' }];
      parts = zFinish(core, p, q);
      break;
    }
    case 'evid': {
      const core = [{ t: stem, k: 'stem' }];
      if (neg) core.push(negPart(stem));
      core.push({ t: `m${h4(join(core))}ş`, k: 'tense' });
      parts = zFinish(core, p, q);
      break;
    }
    case 'nec': {
      const core = [{ t: stem, k: 'stem' }];
      if (neg) core.push(negPart(stem));
      const m = `m${h2(join(core))}`;
      core.push({ t: `${m}l${h4(m)}`, k: 'tense' });
      parts = zFinish(core, p, q);
      break;
    }
    case 'abil': {
      const s = isYeDe(stem) ? `${stem[0]}i` : softV(stem);
      const core = [{ t: s, k: 'stem' }];
      if (endsVowel(s)) core.push({ t: 'y', k: 'buf' });
      const e = h2(s);
      if (!neg) {
        core.push({ t: `${e}bilir`, k: 'tense' });
        parts = zFinish(core, p, q);
      } else {
        core.push({ t: `${e}m${e}`, k: 'neg' });
        if (q) { parts = zFinish([...core, { t: 'z', k: 'tense' }], p, true); break; }
        if (p === 1) parts = [...core, { t: 'm', k: 'pers' }];
        else if (p === 4) parts = [...core, { t: 'y', k: 'buf' }, { t: `${h4(e)}z`, k: 'pers' }];
        else parts = [...core, { t: 'z', k: 'tense' }, ...persZParts(`m${e}z`, p)];
      }
      break;
    }
    case 'opt': {
      // 1인칭만: geleyim / gelelim
      const core = [];
      if (neg) core.push({ t: stem, k: 'stem' }, negPart(stem));
      else core.push({ t: isYeDe(stem) ? `${stem[0]}i` : softV(stem), k: 'stem' });
      const w = join(core);
      if (endsVowel(w)) core.push({ t: 'y', k: 'buf' });
      const e = h2(w);
      if (p === 4) parts = [...core, { t: `${e}l${h4(e)}m`, k: 'tense' }];
      else parts = [...core, { t: `${e}y${h4(e)}m`, k: 'tense' }];
      if (q) parts.push({ t: ` m${h4(join(parts))}`, k: 'q' });
      break;
    }
    case 'imp': {
      const core = [{ t: stem, k: 'stem' }];
      if (neg) core.push(negPart(stem));
      const w = join(core);
      if (p === 2) parts = core;
      else if (p === 3) parts = [...core, { t: `s${h4(w)}n`, k: 'pers' }];
      else if (p === 6) parts = [...core, { t: `s${h4(w)}n`, k: 'pers' }, { t: `l${h2(`s${h4(w)}n`)}r`, k: 'pers' }];
      else {
        // 2인칭 복수·존댓말: gelin, gidin, okuyun, yiyin, deyin
        if (neg) parts = [...core, { t: 'y', k: 'buf' }, { t: `${h4(w)}n`, k: 'pers' }];
        else if (stem === 'ye') parts = [{ t: 'yi', k: 'stem' }, { t: 'y', k: 'buf' }, { t: 'in', k: 'pers' }];
        else if (stem === 'de') parts = [{ t: 'de', k: 'stem' }, { t: 'y', k: 'buf' }, { t: 'in', k: 'pers' }];
        else {
          const s = softV(stem);
          parts = [{ t: s, k: 'stem' }];
          if (endsVowel(s)) parts.push({ t: 'y', k: 'buf' });
          parts.push({ t: `${h4(s)}n`, k: 'pers' });
        }
      }
      break;
    }
    case 'want': {
      const inf2 = `${stem}m${h2(stem)}k`;
      const r = conjugate('istemek', 'prog', p, { neg, q });
      parts = [{ t: inf2, k: 'stem' }, { t: ' ', k: 'buf' }, ...r.parts.map((x) => (x.k === 'stem' ? { ...x, k: 'tense' } : x))];
      break;
    }
    default:
      throw new Error(`unknown tense ${tense}`);
  }
  if (prefix) parts = [{ t: `${prefix} `, k: 'stem' }, ...parts];
  return result(parts);
}

/** 활용 가능한 인칭 (청유는 1·4, 명령은 2·3·5·6) */
export function personsFor(tense) {
  if (tense === 'opt') return [1, 4];
  if (tense === 'imp') return [2, 3, 5, 6];
  return [1, 2, 3, 4, 5, 6];
}
