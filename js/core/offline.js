// 오프라인 팩: 녹음 음성 전부 + 글꼴을 기기에 저장해 인터넷(데이터) 없이 학습
// 앱으로 설치해 처음 열면 와이파이에서 자동으로 받는다 (모바일 데이터·데이터 절약 모드에서는 자동으로 받지 않음)
import { state } from './store.js';
import { recordingIds, recordingCount, recordingBytes, audioUrl, AUDIO_CACHE, loadAudioIndex } from './tts.js';

export const FONT_CACHE = 'merhaba-fonts-v1'; // sw.js와 같은 이름
const FONT_HOSTS = /fonts\.googleapis\.com|cdn\.jsdelivr\.net/;

// ---------- 환경 ----------
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
  || document.referrer.startsWith('android-app://');

export function platform() {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

/** 앱 안 브라우저(카카오톡·네이버·인스타그램 등) — 여기서는 앱 설치가 안 된다 */
export function inAppBrowser() {
  const ua = navigator.userAgent;
  if (/KAKAOTALK/i.test(ua)) return 'kakao';
  if (/NAVER\(inapp|Whale\/.*inapp/i.test(ua)) return 'naver';
  if (/Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp/i.test(ua)) return 'other';
  return null;
}

/** 모바일 데이터이거나 데이터 절약 모드 (알 수 있는 브라우저에서만) */
export const meteredConnection = () => navigator.connection?.type === 'cellular' || !!navigator.connection?.saveData;

// ---------- 상태 ----------
let job = null; // 진행 중인 내려받기 { done, total, failed, stop, auto, fonts }
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());
export const offlineJob = () => job;
export function onOfflineChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function cachedAudioIds() {
  if (!('caches' in window)) return new Set();
  const c = await caches.open(AUDIO_CACHE);
  return new Set((await c.keys()).map((r) => new URL(r.url).pathname.split('/').pop().replace(/\.mp3$/, '')));
}

async function fontsCached() {
  if (!('caches' in window)) return false;
  return (await (await caches.open(FONT_CACHE)).keys()).length >= 20;
}

/** { total, have, ready, mbLeft, fonts } */
export async function offlineStatus() {
  await loadAudioIndex();
  const total = recordingCount();
  const haveSet = await cachedAudioIds();
  const have = recordingIds().filter((id) => haveSet.has(id)).length;
  const fonts = await fontsCached();
  const mbLeft = total ? Math.max(1, Math.round((recordingBytes() * (total - have)) / total / 1048576) + (fonts ? 0 : 3)) : 0;
  return { total, have, fonts, ready: total > 0 && have >= total && fonts, mbLeft };
}

// ---------- 내려받기 ----------
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length && !job?.stop) await fn(items[i++]);
  }));
}

/** 화면에 쓰는 글꼴(한글 Pretendard·튀르키예 문자 Inter)의 모든 조각을 보관 — 오프라인에서도 글자가 깨지지 않게 */
async function cacheFonts() {
  const cache = await caches.open(FONT_CACHE);
  const sheets = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href).filter((u) => FONT_HOSTS.test(u));
  for (const css of sheets) {
    try {
      const res = await fetch(css, { mode: 'cors' });
      if (!res.ok) continue;
      await cache.put(css, res.clone());
      const text = await res.text();
      const urls = [...new Set([...text.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => new URL(m[2], css).href))];
      const have = new Set((await cache.keys()).map((r) => r.url));
      await pool(urls.filter((u) => !have.has(u)), 6, async (u) => {
        try {
          const r = await fetch(u, { mode: 'cors' });
          if (r.ok) await cache.put(u, r);
        } catch { /* 다음 기회에 */ }
      });
    } catch { /* 글꼴 서버에 닿지 않으면 시스템 글꼴로 */ }
  }
}

/**
 * 녹음 음성 전부 + 글꼴을 내려받는다. 이미 받은 것은 건너뛴다.
 * @returns {Promise<{ok: boolean, failed: number, stopped: boolean}>}
 */
export function downloadOffline({ auto = false } = {}) {
  if (job) return job.promise;
  job = { done: 0, total: 0, failed: 0, stop: false, auto, fonts: false };
  job.promise = (async () => {
    try {
      await navigator.storage?.persist?.();
      await loadAudioIndex();
      const ids = recordingIds();
      const have = await cachedAudioIds();
      const todo = ids.filter((id) => !have.has(id));
      job.total = ids.length;
      job.done = ids.length - todo.length;
      notify();
      const cache = await caches.open(AUDIO_CACHE);
      await pool(todo, 6, async (id) => {
        const url = new URL(audioUrl(id), location.href).href;
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res.ok && res.status === 200) await cache.put(url, res);
          else job.failed++;
        } catch { job.failed++; }
        job.done++;
        if (job.done % 25 === 0 || job.done === job.total) notify();
      });
      if (!job.stop) {
        await cacheFonts();
        job.fonts = true;
      }
      return { ok: !job.stop && job.failed === 0, failed: job.failed, stopped: job.stop };
    } catch {
      return { ok: false, failed: -1, stopped: false };
    } finally {
      job = null;
      notify();
    }
  })();
  notify();
  return job.promise;
}

export const stopOffline = () => { if (job) job.stop = true; };

/**
 * 앱으로 설치해 열었을 때: 아직 다 받지 않았으면 와이파이에서 자동으로 받는다.
 * @returns {Promise<'started'|'ready'|'skipped'>}
 */
export async function autoOffline() {
  if (!isStandalone() || !('caches' in window) || state.settings.autoOffline === false) return 'skipped';
  if (!navigator.onLine || meteredConnection()) return 'skipped';
  const st = await offlineStatus();
  if (!st.total) return 'skipped';
  if (st.ready) return 'ready';
  downloadOffline({ auto: true });
  return 'started';
}
