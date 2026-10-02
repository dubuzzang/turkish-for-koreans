// 튀르키예어 → 한글 발음 표기 (학습 초기용 근사치)
// 규칙: 음절 분리 → 초성/중성/종성 매핑. 받침으로 쓸 수 없는 자음은 '으'(ş·ç·c·j는 '이')를 붙여 표기.
// 예) merhaba → 메르하바, günaydın → 귀나이든, teşekkür → 테셱퀴르, güle → 귈레
import { trLower } from './tr.js';

const VOWELS = 'aeıioöuü';
// 중성 인덱스: ㅏ0 ㅑ2 ㅔ5 ㅖ7 ㅗ8 ㅚ11 ㅛ12 ㅜ13 ㅟ16 ㅠ17 ㅡ18 ㅣ20
const V = { a: 0, e: 5, ı: 18, i: 20, o: 8, ö: 11, u: 13, ü: 16 };
const VY = { a: 2, e: 7, i: 20, o: 12, ö: 12, u: 17, ü: 17 };
const VSH = { a: 2, e: 7, i: 20, ı: 20, o: 12, u: 17, ö: 11, ü: 16 };
// 초성 인덱스: ㄱ0 ㄴ2 ㄷ3 ㄹ5 ㅁ6 ㅂ7 ㅅ9 ㅇ11 ㅈ12 ㅊ14 ㅋ15 ㅌ16 ㅍ17 ㅎ18
const L = { b: 7, c: 12, ç: 14, d: 3, f: 17, g: 0, ğ: 11, h: 18, j: 12, k: 15, l: 5, m: 6, n: 2, p: 17, r: 5, s: 9, ş: 9, t: 16, v: 7, y: 11, z: 12 };
// 종성 인덱스
const T = { k: 1, n: 4, ng: 21, l: 8, m: 16, p: 17, t: 19 };

const compose = (o) => String.fromCharCode(0xac00 + (o.L * 21 + o.V) * 28 + o.T);

function wordToHangul(raw) {
  const s = trLower(raw).replace(/[’'`]/g, '').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u');
  const chars = [...s];
  if (chars.some((c) => !(c in L) && !VOWELS.includes(c))) return raw;
  const vIdx = [];
  chars.forEach((c, i) => { if (VOWELS.includes(c)) vIdx.push(i); });
  if (!vIdx.length) return raw;

  // 1) 음절 나누기: 모음 사이 자음은 마지막 하나만 다음 음절 초성으로
  const syls = [];
  vIdx.forEach((vi, k) => {
    const from = k === 0 ? 0 : vIdx[k - 1] + 1;
    const cluster = chars.slice(from, vi);
    let onset = cluster;
    if (k > 0) {
      const codaCount = cluster.length >= 4 ? 2 : Math.max(0, cluster.length - 1);
      syls[k - 1].coda.push(...cluster.slice(0, codaCount));
      onset = cluster.slice(codaCount);
    }
    syls.push({ onset, v: chars[vi], coda: [] });
  });
  syls[syls.length - 1].coda.push(...chars.slice(vIdx[vIdx.length - 1] + 1));

  // 2) 한글 음절 조립
  const out = [];
  const push = (Li, Vi, ep = false) => { out.push({ L: Li, V: Vi, T: 0, ep }); return out[out.length - 1]; };
  const epenthetic = (c) => {
    if (c === 'ğ') return;
    if (c === 'y') { push(11, 20, true); return; }
    push(L[c], 'şçcj'.includes(c) ? 20 : 18, true);
  };

  syls.forEach((sy, k) => {
    const next = syls[k + 1];
    const onset = sy.onset;
    onset.slice(0, -1).forEach(epenthetic);
    const c = onset[onset.length - 1];
    let Li, Vi;
    if (!c || c === 'ğ') { Li = 11; Vi = V[sy.v]; }
    else if (c === 'y') {
      if (sy.v === 'ı') { push(11, 20); Li = 11; Vi = 18; }
      else { Li = 11; Vi = VY[sy.v]; }
    } else if (c === 'ş') { Li = 9; Vi = VSH[sy.v]; }
    else { Li = L[c]; Vi = V[sy.v]; }
    // 모음 뒤 l → ㄹㄹ (güle → 귈레)
    if (c === 'l' && out.length && out[out.length - 1].T === 0) out[out.length - 1].T = T.l;
    push(Li, Vi);

    const nextOnset = next ? next.onset[0] : null;
    sy.coda.forEach((cc, ci) => {
      const cur = out[out.length - 1];
      const followed = ci < sy.coda.length - 1 ? sy.coda[ci + 1] : nextOnset;
      if (cc === 'ğ') return;
      if (cur.T === 0 && cc === 'n') { cur.T = followed === 'k' || followed === 'g' ? T.ng : T.n; return; }
      if (cur.T === 0 && cc === 'm') { cur.T = T.m; return; }
      if (cur.T === 0 && cc === 'l') { cur.T = T.l; return; }
      if ('kpt'.includes(cc) && ci === 0 && cur.T === 0 && !cur.ep) {
        const wordFinal = !next && sy.coda.length === 1;
        if (wordFinal || followed === cc) { cur.T = T[cc]; return; }
      }
      // 겹자음(ff, ss …)은 하나만 표기
      if (ci === sy.coda.length - 1 && followed === cc) return;
      epenthetic(cc);
    });
  });
  return out.map(compose).join('');
}

const cache = new Map();
/** 문장 전체를 한글 발음으로 (구두점·숫자는 그대로) */
export function toHangul(text) {
  if (!text) return '';
  if (cache.has(text)) return cache.get(text);
  const res = String(text)
    .split(/([^A-Za-zÇĞİÖŞÜÂÎÛçğıöşüâîû’'`]+)/)
    .map((tok) => (/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(tok) ? wordToHangul(tok) : tok))
    .join('');
  if (cache.size > 3000) cache.clear();
  cache.set(text, res);
  return res;
}
