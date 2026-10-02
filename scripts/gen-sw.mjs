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
  return ['./', 'index.html', 'manifest.webmanifest', ...list('css'), ...list('js'), ...list('icons').filter((f) => /\.(png|svg)$/.test(f))].sort();
}

export function version() {
  return readFileSync(join(ROOT, 'js/version.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];
}

export function render() {
  return `/* Merhaba 서비스 워커 — scripts/gen-sw.mjs가 만든 파일이에요 (직접 고치지 마세요) */
const VERSION = '${version()}';
const CACHE = \`merhaba-\${VERSION}\`;
const FONT_CACHE = 'merhaba-fonts-v1';
const ASSETS = ${JSON.stringify(assetList(), null, 2)};

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
