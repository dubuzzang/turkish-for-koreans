// 녹음 음성 파일 찾기 키 — 앱(재생)과 scripts/audio-texts.mjs(생성)가 같은 함수를 쓴다.
// 대소문자·문장부호·띄어쓰기 차이는 무시하고, 의문문(?)만 따로 구분한다.

const lowerTr = (s) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

export function audioKey(text) {
  const s = lowerTr(String(text ?? '').normalize('NFC'));
  const core = s.replace(/[’']/g, '').replace(/[^0-9a-zçğıöşüâîû]+/g, ' ').trim();
  if (!core) return '';
  return /\?[\s"'”’»)]*$/.test(s) ? `${core}?` : core;
}

// cyrb53 (53비트 문자열 해시)
function cyrb53(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

const ID_SPACE = 36 ** 9;
// 녹음을 통째로 새로 만들면 올린다 → 파일 이름이 모두 바뀌어, 기기에 보관된 예전 녹음이 섞이지 않는다
// (1: VoxCPM2 · a1: Anka-TTS)
export const AUDIO_REV = 'a1';

/** 음성 파일 이름(확장자 제외). voice: 'f'(기본 여성) · 'm'(남성) */
export function audioId(text, voice = 'f') {
  const k = audioKey(text);
  return k ? (cyrb53(`${AUDIO_REV}|${voice}|${k}`) % ID_SPACE).toString(36).padStart(9, '0') : null;
}
