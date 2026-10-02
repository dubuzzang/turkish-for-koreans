// 배포용 사이트 폴더(_site) 만들기 — GitHub Pages · Cloudflare Pages 공용.  사용: npm run build
import { rmSync, mkdirSync, copyFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, '_site');
export const SITE_FILES = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons', 'audio', 'download', '.well-known'];

// Cloudflare Pages 응답 헤더 (GitHub Pages는 무시)
export const HEADERS = `# 녹음 파일은 내용이 바뀌면 이름(id)도 바뀌므로 오래 보관해도 된다
/audio/*.mp3
  Cache-Control: public, max-age=31536000, immutable
/audio/index.json
  Cache-Control: public, max-age=300
# 서비스 워커는 매번 새로 확인해야 업데이트가 바로 전달된다
/sw.js
  Cache-Control: no-cache
/.well-known/assetlinks.json
  Content-Type: application/json
  Access-Control-Allow-Origin: *
/download/*
  Content-Type: application/vnd.android.package-archive
  Content-Disposition: attachment; filename="merhaba.apk"
  Cache-Control: public, max-age=300
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`;

const size = (p) => (statSync(p).isDirectory() ? readdirSync(p).reduce((s, f) => s + size(join(p, f)), 0) : statSync(p).size);

// fs.cpSync(recursive)가 Windows의 한글 경로에서 Node를 멈추게 해서 직접 복사한다
function copy(src, dst) {
  if (statSync(src).isDirectory()) {
    mkdirSync(dst, { recursive: true });
    for (const f of readdirSync(src)) copy(join(src, f), join(dst, f));
  } else copyFileSync(src, dst);
}

export function build() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  for (const p of SITE_FILES) {
    if (existsSync(join(ROOT, p))) copy(join(ROOT, p), join(OUT, p));
  }
  writeFileSync(join(OUT, '.nojekyll'), '');
  writeFileSync(join(OUT, '_headers'), HEADERS);
  return size(OUT);
}

if (process.argv[1] && process.argv[1].endsWith('build-site.mjs')) {
  const bytes = build();
  console.log(`_site 생성: ${(bytes / 1048576).toFixed(1)}MB`);
}
