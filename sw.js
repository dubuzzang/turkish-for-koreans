/* Merhaba 서비스 워커 — scripts/gen-sw.mjs가 만든 파일이에요 (직접 고치지 마세요) */
const VERSION = '1.4.0';
const CACHE = `merhaba-${VERSION}`;
const FONT_CACHE = 'merhaba-fonts-v1';
const ASSETS = [
  "./",
  "css/app.css",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "icons/maskable-512.png",
  "icons/maskable.svg",
  "index.html",
  "js/app.js",
  "js/core/deck.js",
  "js/core/drillgen.js",
  "js/core/hangul.js",
  "js/core/ko.js",
  "js/core/lessonBuilder.js",
  "js/core/morph.js",
  "js/core/numbers.js",
  "js/core/sfx.js",
  "js/core/srs.js",
  "js/core/store.js",
  "js/core/stt.js",
  "js/core/tr.js",
  "js/core/tts.js",
  "js/core/ui.js",
  "js/data/alphabet.js",
  "js/data/curriculum-2.js",
  "js/data/curriculum-3.js",
  "js/data/curriculum.js",
  "js/data/daily.js",
  "js/data/dialogues.js",
  "js/data/notes-2.js",
  "js/data/notes.js",
  "js/data/phrases.js",
  "js/data/vocab-1.js",
  "js/data/vocab-2.js",
  "js/data/vocab-3.js",
  "js/data/vocab-4.js",
  "js/data/vocab-5.js",
  "js/data/vocab.js",
  "js/version.js",
  "js/views/alphabet.js",
  "js/views/drill.js",
  "js/views/exercises.js",
  "js/views/grammar.js",
  "js/views/home.js",
  "js/views/learn.js",
  "js/views/lesson.js",
  "js/views/onboarding.js",
  "js/views/phrases.js",
  "js/views/practice.js",
  "js/views/review.js",
  "js/views/session.js",
  "js/views/settings.js",
  "js/views/stats.js",
  "js/views/talk.js",
  "js/views/wordforms.js",
  "js/views/words.js",
  "manifest.webmanifest"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('merhaba-') && k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      e.respondWith(caches.match('index.html').then((hit) => hit || fetch(req)));
      return;
    }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
    return;
  }
  // 글꼴(Google Fonts · Pretendard)은 처음 받은 뒤 오프라인에서도 쓰도록 보관
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$|(^|\.)cdn\.jsdelivr\.net$/.test(url.hostname)) {
    e.respondWith(caches.open(FONT_CACHE).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') c.put(req, res.clone());
        return res;
      } catch {
        return Response.error();
      }
    }));
  }
});
