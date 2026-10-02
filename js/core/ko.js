// 한국어 조사 붙이기 (받침에 따라 을/를, 이/가, 은/는, 으로/로, 과/와)

function lastHangul(word) {
  const s = String(word).replace(/[\s)\]）"'”’.!?,]+$/, '');
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s.charCodeAt(i);
    if (c >= 0xac00 && c <= 0xd7a3) return c;
    if (/[0-9]/.test(s[i])) return s[i];
    if (/[A-Za-z]/.test(s[i])) return null;
  }
  return null;
}
const DIGIT_BATCHIM = { 0: 'ㅇ', 1: 'ㄹ', 2: '', 3: 'ㅁ', 4: '', 5: '', 6: 'ㄱ', 7: 'ㄹ', 8: 'ㄹ', 9: '' };

/** 받침: '' 없음, 'ㄹ', 기타 */
export function batchim(word) {
  const c = lastHangul(word);
  if (c == null) return 'x';
  if (typeof c === 'string') return DIGIT_BATCHIM[c] ? (DIGIT_BATCHIM[c] === 'ㄹ' ? 'ㄹ' : 'o') : '';
  const jong = (c - 0xac00) % 28;
  if (jong === 0) return '';
  return jong === 8 ? 'ㄹ' : 'o';
}

/** josa('책','을/를') → '책을' */
export function josa(word, pair) {
  const [withB, noB] = pair.split('/');
  const b = batchim(word);
  if (pair === '으로/로') return word + (b === '' || b === 'ㄹ' ? '로' : '으로');
  if (b === 'x') return `${word}${withB}(${noB})`;
  return word + (b ? withB : noB);
}

/** 뜻에서 첫 낱말만 (예: "집" ← "집, 주택") */
export const headKo = (ko) => String(ko).split(/[;,]/)[0].replace(/\(.*?\)/g, '').trim();

export const CASE_GLOSS = {
  nom: (k) => k,
  acc: (k) => josa(k, '을/를'),
  dat: (k) => `${k}에(게)`,
  loc: (k) => `${k}에(서)`,
  abl: (k) => `${k}에서/부터`,
  gen: (k) => `${k}의`,
  ins: (k) => `${josa(k, '과/와')}, ${josa(k, '으로/로')}`,
};
