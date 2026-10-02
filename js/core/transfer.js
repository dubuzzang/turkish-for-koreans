// 학습 기록 옮기기: 주소(GitHub Pages ↔ Cloudflare)·브라우저·앱 사이에 기록을 코드 하나로 옮긴다
// 기록은 주소(출처)마다 따로 저장되기 때문에, 앱으로 설치하면 처음에는 비어 있다.
import { exportJSON, importJSON } from './store.js';

export const APP_ORIGIN = 'https://turkish-for-koreans.pages.dev';

function toB64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}
const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

/** 지금 기록 → 옮기기 코드 (g: gzip 압축, j: 그대로) */
export async function packRecords() {
  const bytes = new TextEncoder().encode(exportJSON());
  if (typeof CompressionStream === 'function') return `g${toB64url(await pipe(bytes, new CompressionStream('gzip')))}`;
  return `j${toB64url(bytes)}`;
}

/** 옮기기 코드 → 기록으로 바꿔 넣기 (형식이 틀리면 오류) */
export async function unpackRecords(code) {
  const c = String(code || '').trim().replace(/^.*#\/move\//, '');
  if (!/^[gj][A-Za-z0-9_-]+$/.test(c)) throw new Error('옮기기 코드가 올바르지 않아요');
  let bytes = fromB64url(c.slice(1));
  if (c[0] === 'g') {
    if (typeof DecompressionStream !== 'function') throw new Error('이 브라우저는 압축된 코드를 풀 수 없어요');
    bytes = await pipe(bytes, new DecompressionStream('gzip'));
  }
  importJSON(new TextDecoder().decode(bytes));
}

/** 앱 주소에서 기록을 받아 여는 링크 */
export const moveLink = (code) => `${APP_ORIGIN}/#/move/${code}`;
