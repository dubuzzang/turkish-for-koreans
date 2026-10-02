// 튀르키예어 문자열 도우미 — 대소문자(İ/ı), 정규화, 채점, 차이 표시

export const VOWELS = 'aeıioöuü';
export const TR_EXTRA = ['ç', 'ğ', 'ı', 'İ', 'ö', 'ş', 'ü'];

export const trLower = (s) => String(s ?? '').normalize('NFC').toLocaleLowerCase('tr-TR').replace(/̇/g, '');
export const trUpper = (s) => String(s ?? '').normalize('NFC').toLocaleUpperCase('tr-TR');
export const capitalize = (s) => (s ? trUpper(s[0]) + s.slice(1) : s);

const FOLD = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
/** 튀르키예어 특수문자를 기본 라틴 문자로 접기 (ş → s 등) */
export const fold = (s) => s.replace(/[çğıöşüâîû]/g, (c) => FOLD[c]);

/** 비교용 정규화: 소문자(튀르키예어 규칙), 아포스트로피 제거, 구두점 제거, 공백 정리 */
export function normalize(s) {
  return trLower(s)
    .replace(/[’'`´ʼ‘]/g, '')
    .replace(/[.,!?¿¡;:"“”«»()[\]…–—\-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * 입력 채점.
 * level: exact(완벽) · accent(특수문자만 다름) · typo(오타 1~2자) · wrong · empty
 * strict: 문법 드릴처럼 한 글자가 핵심일 때 — 특수문자 차이·오타를 오답 처리
 */
export function checkAnswer(input, answers, { strict = false } = {}) {
  const list = (Array.isArray(answers) ? answers : [answers]).filter(Boolean);
  const n = normalize(input);
  if (!n) return { ok: false, level: 'empty', expected: list[0] };
  let best = null;
  for (const a of list) {
    const na = normalize(a);
    if (n === na) return { ok: true, level: 'exact', expected: a };
    if (fold(n) === fold(na)) {
      if (!best || best.level !== 'accent') best = { ok: !strict, level: 'accent', expected: a };
      continue;
    }
    if (!strict && !best) {
      const d = lev(fold(n), fold(na));
      const tol = na.length >= 10 ? 2 : na.length >= 4 ? 1 : 0;
      if (d <= tol) best = { ok: true, level: 'typo', expected: a };
    }
  }
  return best || { ok: false, level: 'wrong', expected: list[0] };
}

/** 사용자가 입력한 글자 중 틀린 위치 표시용 정렬 (입력 기준) */
export function diffChars(input, expected) {
  const a = [...trLower(input)], b = [...trLower(expected)];
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  const out = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      out.push({ ch: [...input][i - 1] ?? a[i - 1], ok: a[i - 1] === b[j - 1] });
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      out.push({ ch: [...input][i - 1] ?? a[i - 1], ok: false });
      i--;
    } else {
      out.push({ ch: '·', ok: false, miss: true });
      j--;
    }
  }
  return out.reverse();
}

/** 어떤 특수문자가 빠졌는지 안내 (예: "ş, ı") */
export function accentHint(input, expected) {
  const a = trLower(input), b = trLower(expected);
  const missing = new Set();
  for (const ch of b) if ('çğıöşü'.includes(ch) && !a.includes(ch)) missing.add(ch);
  return [...missing].join(', ');
}

/** 문장을 단어 타일로 자르기 (문장부호 제거, 아포스트로피는 단어 안에 유지) */
export function tokenize(sentence) {
  return String(sentence)
    .replace(/[—–]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[.,!?;:"“”«»()…]+|[.,!?;:"“”«»()…]+$/g, ''))
    .filter(Boolean);
}
