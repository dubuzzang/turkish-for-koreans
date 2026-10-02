// 튀르키예어 음성 인식 (Web Speech API) — 크롬·엣지·사파리(iOS 14.5+)에서 동작
import { normalize, fold, lev } from './tr.js';

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
export const sttSupported = !!SR;

let active = null;

/** 한 번 듣기. { ok, alternatives:[문자열], error } 로 resolve */
export function listenOnce({ lang = 'tr-TR', timeoutMs = 9000 } = {}) {
  return new Promise((resolve) => {
    if (!SR) return resolve({ ok: false, error: 'unsupported', alternatives: [] });
    try { active?.abort(); } catch { /* 무시 */ }
    const rec = new SR();
    active = rec;
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    let done = false;
    const finish = (r) => { if (!done) { done = true; clearTimeout(timer); resolve(r); } };
    rec.onresult = (e) => {
      const res = e.results[0];
      const alternatives = [];
      for (let i = 0; i < res.length; i++) alternatives.push(res[i].transcript);
      finish({ ok: true, alternatives });
    };
    rec.onerror = (e) => finish({ ok: false, error: e.error || 'error', alternatives: [] });
    rec.onend = () => finish({ ok: false, error: 'no-speech', alternatives: [] });
    const timer = setTimeout(() => { try { rec.stop(); } catch { /* 무시 */ } }, timeoutMs);
    try { rec.start(); } catch (err) { finish({ ok: false, error: String(err), alternatives: [] }); }
  });
}

export function stopListening() {
  try { active?.abort(); } catch { /* 무시 */ }
}

/** 0~1 유사도 (특수문자 차이는 거의 감점하지 않음) */
export function similarity(a, b) {
  const x = fold(normalize(a)), y = fold(normalize(b));
  if (!x && !y) return 1;
  const d = lev(x, y);
  return Math.max(0, 1 - d / Math.max(x.length, y.length));
}

/** 여러 인식 후보 중 가장 비슷한 것 */
export function bestMatch(alternatives, target) {
  let best = { text: alternatives[0] || '', score: 0 };
  for (const alt of alternatives) {
    const s = similarity(alt, target);
    if (s > best.score) best = { text: alt, score: s };
  }
  return best;
}

/** 목표 문장의 단어별 일치 여부 (화면 표시용) */
export function wordMatches(target, heard) {
  const heardWords = fold(normalize(heard)).split(' ');
  return String(target).split(/\s+/).map((w) => {
    const k = fold(normalize(w));
    const ok = heardWords.some((h) => h === k || (k.length > 3 && lev(h, k) <= 1));
    return { w, ok };
  });
}

export const STT_ERRORS = {
  'not-allowed': '마이크 권한이 꺼져 있어요. 브라우저 설정에서 마이크를 허용해 주세요.',
  'service-not-allowed': '이 브라우저에서는 음성 인식을 쓸 수 없어요.',
  'no-speech': '소리가 들리지 않았어요. 마이크 가까이에서 다시 말해 보세요.',
  'audio-capture': '마이크를 찾을 수 없어요.',
  network: '음성 인식은 인터넷 연결이 필요해요.',
  unsupported: '이 브라우저는 음성 인식을 지원하지 않아요. 크롬이나 사파리를 써 보세요.',
};
