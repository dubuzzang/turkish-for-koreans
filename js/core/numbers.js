// 숫자 · 서수 · 가격 · 시각 → 튀르키예어 (규칙 생성, DOM 없음)

const ONES = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];

function below1000(n) {
  const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10;
  const out = [];
  if (h) out.push(h === 1 ? 'yüz' : `${ONES[h]} yüz`);
  if (t) out.push(TENS[t]);
  if (o) out.push(ONES[o]);
  return out.join(' ');
}

/** 0 ~ 999,999,999,999 → 튀르키예어 (띄어쓰기는 TDK 방식: iki yüz otuz dört) */
export function numberTr(n) {
  n = Math.floor(Math.abs(n));
  if (n === 0) return 'sıfır';
  const parts = [];
  const billions = Math.floor(n / 1e9), millions = Math.floor((n % 1e9) / 1e6), thousands = Math.floor((n % 1e6) / 1e3), rest = n % 1e3;
  if (billions) parts.push(`${below1000(billions)} milyar`);
  if (millions) parts.push(`${below1000(millions)} milyon`);
  if (thousands) parts.push(thousands === 1 ? 'bin' : `${below1000(thousands)} bin`);
  if (rest) parts.push(below1000(rest));
  return parts.join(' ');
}

/** 서수: birinci, ikinci, üçüncü, dördüncü … */
export function ordinalTr(n) {
  const w = numberTr(n);
  const words = w.split(' ');
  let last = words.pop();
  const lastV = [...last].reverse().find((c) => 'aeıioöuü'.includes(c));
  const v = { a: 'ı', ı: 'ı', o: 'u', u: 'u', e: 'i', i: 'i', ö: 'ü', ü: 'ü' }[lastV];
  if (last === 'dört') last = 'dörd';
  const suffix = 'aeıioöuü'.includes(last.slice(-1)) ? `nc${v}` : `${v}nc${v}`;
  return [...words, last + suffix].join(' ');
}

/** 가격: 45.5 → "kırk beş lira elli kuruş" */
export function priceTr(amount) {
  const lira = Math.floor(amount + 1e-9);
  const kurus = Math.round((amount - lira) * 100);
  const out = [];
  if (lira) out.push(`${numberTr(lira)} lira`);
  if (kurus) out.push(`${numberTr(kurus)} kuruş`);
  return out.join(' ') || 'sıfır lira';
}

// 시각에 쓰는 시(時)의 목적격·여격 (geçiyor 앞 목적격, var 앞 여격)
const HOUR_ACC = ['', 'biri', 'ikiyi', 'üçü', 'dördü', 'beşi', 'altıyı', 'yediyi', 'sekizi', 'dokuzu', 'onu', 'on biri', 'on ikiyi'];
const HOUR_DAT = ['', 'bire', 'ikiye', 'üçe', 'dörde', 'beşe', 'altıya', 'yediye', 'sekize', 'dokuza', 'ona', 'on bire', 'on ikiye'];
const HOUR_LOC = ['', 'birde', 'ikide', 'üçte', 'dörtte', 'beşte', 'altıda', 'yedide', 'sekizde', 'dokuzda', 'onda', 'on birde', 'on ikide'];

/**
 * "Saat kaç?"에 대한 답 (12시간제 읽기)
 * 3:00 Saat üç. · 3:30 Saat üç buçuk. · 3:15 Saat üçü çeyrek geçiyor. · 3:45 Saat dörde çeyrek var.
 */
export function timeTr(h, m) {
  const h12 = h % 12 || 12;
  if (m === 0) return `Saat ${numberTr(h12)}.`;
  if (m === 30) return `Saat ${numberTr(h12)} buçuk.`;
  if (m < 30) return `Saat ${HOUR_ACC[h12]} ${m === 15 ? 'çeyrek' : numberTr(m)} geçiyor.`;
  const next = (h12 % 12) + 1;
  const rem = 60 - m;
  return `Saat ${HOUR_DAT[next]} ${rem === 15 ? 'çeyrek' : numberTr(rem)} var.`;
}

/** "Saat kaçta?"(몇 시에?)에 대한 답: üçte, üç buçukta, üçü çeyrek geçe, dörde çeyrek kala */
export function timeAtTr(h, m) {
  const h12 = h % 12 || 12;
  if (m === 0) return `Saat ${HOUR_LOC[h12]}.`;
  if (m === 30) return `Saat ${numberTr(h12)} buçukta.`;
  if (m < 30) return `Saat ${HOUR_ACC[h12]} ${m === 15 ? 'çeyrek' : numberTr(m)} geçe.`;
  const next = (h12 % 12) + 1;
  const rem = 60 - m;
  return `Saat ${HOUR_DAT[next]} ${rem === 15 ? 'çeyrek' : numberTr(rem)} kala.`;
}

/** 디지털 읽기: 15:45 → "on beş kırk beş" */
export function timeDigitalTr(h, m) {
  return m === 0 ? `${numberTr(h)}` : `${h === 0 ? 'sıfır' : numberTr(h)} ${m < 10 ? `sıfır ${numberTr(m)}` : numberTr(m)}`;
}

export const fmtClock = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
