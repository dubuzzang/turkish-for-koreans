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
  for (const f of ['index.html', 'css/app.css', 'js/app.js', 'manifest.webmanifest', 'icons/icon-192.png']) assert.ok(list.includes(f), f);
  for (const f of list) if (f !== './') assert.ok(existsSync(f), f);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.version, version(), 'package.json과 js/version.js 버전 불일치');
});
