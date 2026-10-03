/* Merhaba 서비스 워커 — scripts/gen-sw.mjs가 만든 파일이에요 (직접 고치지 마세요) */
const VERSION = '1.7.1';
const CACHE = `merhaba-${VERSION}`;
const FONT_CACHE = 'merhaba-fonts-v1';
const AUDIO_CACHE = 'merhaba-audio-v2'; // 녹음 음성: 버전이 바뀌어도 유지 (파일 이름이 내용마다 다름)
const ASSETS = [
  "./",
  "audio/index.json",
  "css/app.css",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "icons/maskable-512.png",
  "icons/maskable.svg",
  "js/app.js",
  "js/core/audiokey.js",
  "js/core/deck.js",
  "js/core/drillgen.js",
  "js/core/hangul.js",
  "js/core/ko.js",
  "js/core/lessonBuilder.js",
  "js/core/morph.js",
  "js/core/numbers.js",
  "js/core/offline.js",
  "js/core/sfx.js",
  "js/core/srs.js",
  "js/core/store.js",
  "js/core/stt.js",
  "js/core/tr.js",
  "js/core/transfer.js",
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
  "js/data/speech.js",
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
  "js/views/install.js",
  "js/views/learn.js",
  "js/views/lesson.js",
  "js/views/move.js",
  "js/views/offlinecard.js",
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

// 새 버전은 기다리지 않고 바로 적용한다 (앱은 레슨 중이면 다음 화면으로 넘어갈 때 새로 고친다)
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

// 리디렉션을 거친 응답은 페이지 열기(navigate)에 그대로 쓸 수 없어서 깨끗한 응답으로 바꾼다
async function clean(res) {
  if (!res || !res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('merhaba-') && ![CACHE, FONT_CACHE, AUDIO_CACHE].includes(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// 녹음 음성: 처음 들을 때 받아 보관하고, 오디오 요소의 범위 요청(Range)에도 보관본으로 답한다
async function audioResponse(req) {
  const url = new URL(req.url);
  url.search = '';
  const cache = await caches.open(AUDIO_CACHE);
  let res = await cache.match(url.href);
  if (!res) {
    try {
      const net = await fetch(url.href);
      if (net.status !== 200) return net;
      await cache.put(url.href, net.clone());
      res = net;
    } catch {
      return Response.error();
    }
  }
  const range = req.headers.get('range');
  if (!range) return res;
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  let start = m && m[1] ? Number(m[1]) : 0;
  let end = m && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (m && !m[1] && m[2]) { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes' },
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (/\/audio\/[0-9a-z]+\.mp3$/.test(url.pathname)) {
      e.respondWith(audioResponse(req));
      return;
    }
    if (req.mode === 'navigate') {
      e.respondWith((async () => {
        const hit = await caches.match('./', { cacheName: CACHE });
        if (hit) return clean(hit);
        try {
          return await fetch(req);
        } catch {
          const any = await caches.match('./');
          return any ? clean(any) : Response.error();
        }
      })());
      return;
    }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
    return;
  }
  // 글꼴(Google Fonts · Pretendard)은 처음 받은 뒤 오프라인에서도 쓰도록 보관
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$|(^|\.)cdn\.jsdelivr\.net$/.test(url.hostname)) {
    e.respondWith(caches.open(FONT_CACHE).then(async (c) => {
      const hit = await c.match(req);
      // <link>로 받은 보관본은 불투명 응답이라, 내용을 읽으려는 CORS 요청(오프라인 팩의 글꼴 목록 읽기)에는 새로 받아 준다
      if (hit && !(hit.type === 'opaque' && req.mode === 'cors')) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') c.put(req, res.clone());
        return res;
      } catch {
        return hit || Response.error();
      }
    }));
  }
});
