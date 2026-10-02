// sw.js 생성: 앱 파일 목록과 버전을 서비스 워커에 넣는다.  사용: npm run build:sw
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const list = (dir) => readdirSync(join(ROOT, dir)).flatMap((f) => {
  const p = join(dir, f);
  return statSync(join(ROOT, p)).isDirectory() ? list(p) : [p.replace(/\\/g, '/')];
});

export function assetList() {
  return ['./', 'index.html', 'manifest.webmanifest', 'audio/index.json', ...list('css'), ...list('js'), ...list('icons').filter((f) => /\.(png|svg)$/.test(f))].sort();
}

export function version() {
  return readFileSync(join(ROOT, 'js/version.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];
}

export function render() {
  return `/* Merhaba 서비스 워커 — scripts/gen-sw.mjs가 만든 파일이에요 (직접 고치지 마세요) */
const VERSION = '${version()}';
const CACHE = \`merhaba-\${VERSION}\`;
const FONT_CACHE = 'merhaba-fonts-v1';
const AUDIO_CACHE = 'merhaba-audio-v2'; // 녹음 음성: 버전이 바뀌어도 유지 (파일 이름이 내용마다 다름)
const ASSETS = ${JSON.stringify(assetList(), null, 2)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))));
});

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
  const m = /bytes=(\\d*)-(\\d*)/.exec(range);
  let start = m && m[1] ? Number(m[1]) : 0;
  let end = m && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (m && !m[1] && m[2]) { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': \`bytes */\${size}\` } });
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(end - start + 1), 'Content-Range': \`bytes \${start}-\${end}/\${size}\`, 'Accept-Ranges': 'bytes' },
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (/\\/audio\\/[0-9a-z]+\\.mp3$/.test(url.pathname)) {
      e.respondWith(audioResponse(req));
      return;
    }
    if (req.mode === 'navigate') {
      e.respondWith(caches.match('index.html').then((hit) => hit || fetch(req)));
      return;
    }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
    return;
  }
  // 글꼴(Google Fonts · Pretendard)은 처음 받은 뒤 오프라인에서도 쓰도록 보관
  if (/(^|\\.)fonts\\.(googleapis|gstatic)\\.com$|(^|\\.)cdn\\.jsdelivr\\.net$/.test(url.hostname)) {
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
`;
}

if (process.argv[1] && process.argv[1].endsWith('gen-sw.mjs')) {
  writeFileSync(join(ROOT, 'sw.js'), render());
  console.log(`sw.js 생성: v${version()}, 파일 ${assetList().length}개`);
}
