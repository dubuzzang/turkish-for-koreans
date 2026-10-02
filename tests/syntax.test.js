import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.js') ? [p] : [];
  });
}

test('모든 브라우저 스크립트의 문법이 올바르다', () => {
  for (const f of [...files('js'), ...(statSync('sw.js', { throwIfNoEntry: false }) ? ['sw.js'] : [])]) {
    try {
      execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    } catch (e) {
      assert.fail(`${f}\n${e.stderr?.toString()}`);
    }
  }
});
