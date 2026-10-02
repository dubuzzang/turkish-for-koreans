import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { HEADERS, SITE_FILES } from '../scripts/build-site.mjs';

test('안드로이드 앱 연결: assetlinks 패키지가 TWA 설정과 같고, APK가 있다', () => {
  const links = JSON.parse(readFileSync('.well-known/assetlinks.json', 'utf8'));
  const twa = JSON.parse(readFileSync('android/twa-manifest.json', 'utf8'));
  const t = links[0].target;
  assert.equal(t.package_name, twa.packageId);
  assert.match(t.sha256_cert_fingerprints[0], /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
  assert.ok(links[0].relation.includes('delegate_permission/common.handle_all_urls'));
  assert.equal(twa.host, 'turkish-for-koreans.pages.dev');
  assert.ok(existsSync('download/merhaba.apk'), 'download/merhaba.apk 없음');
  assert.ok(statSync('download/merhaba.apk').size > 500_000);
  assert.ok(Number.isInteger(twa.appVersionCode) && twa.appVersionCode >= 1);
});

test('배포 폴더 구성과 Cloudflare 헤더', () => {
  for (const f of ['index.html', 'sw.js', 'audio', '.well-known', 'download']) assert.ok(SITE_FILES.includes(f), f);
  assert.match(HEADERS, /\/audio\/\*\.mp3\n\s+Cache-Control: public, max-age=31536000, immutable/);
  assert.match(HEADERS, /\/sw\.js\n\s+Cache-Control: no-cache/);
  const m = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
  assert.equal(m.display, 'standalone');
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'));
});
