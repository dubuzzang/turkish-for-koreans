import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { render, assetList, version } from '../scripts/gen-sw.mjs';

test('sw.js가 최신이다 (npm run build:sw)', () => {
  assert.ok(existsSync('sw.js'), 'sw.js 없음 — npm run build:sw');
  assert.equal(readFileSync('sw.js', 'utf8'), render(), 'sw.js가 오래됨 — npm run build:sw 실행');
});

test('미리 저장 목록에 핵심 파일이 있고 실제로 존재한다', () => {
  const list = assetList();
  for (const f of ['./', 'css/app.css', 'js/app.js', 'manifest.webmanifest', 'icons/icon-192.png']) assert.ok(list.includes(f), f);
  // Cloudflare Pages는 /index.html을 /로 리디렉션한다 — 리디렉션된 응답으로 페이지를 열면 ERR_FAILED
  assert.ok(!list.includes('index.html'), 'index.html을 미리 저장하면 안 됨');
  for (const f of list) if (f !== './') assert.ok(existsSync(f), f);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.version, version(), 'package.json과 js/version.js 버전 불일치');
});
