// 짧은 효과음 (Web Audio로 합성 — 파일 없음)
import { state } from './store.js';

let ctx = null;
function ac() {
  if (!state.settings.sfx || navigator.userActivation?.hasBeenActive === false) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(c, freq, at, dur, { type = 'sine', gain = 0.07 } = {}) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + at);
  g.gain.setValueAtTime(0.0001, c.currentTime + at);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + at + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + at);
  o.stop(c.currentTime + at + dur + 0.02);
}

function buzz(ms) {
  if (state.settings.vibrate && navigator.vibrate && navigator.userActivation?.hasBeenActive !== false) {
    try { navigator.vibrate(ms); } catch { /* 무시 */ }
  }
}

export function sfxCorrect() {
  buzz(18);
  const c = ac(); if (!c) return;
  tone(c, 784, 0, 0.12);
  tone(c, 1175, 0.08, 0.2);
}
export function sfxWrong() {
  buzz([30, 40, 30]);
  const c = ac(); if (!c) return;
  tone(c, 233, 0, 0.16, { type: 'triangle', gain: 0.09 });
  tone(c, 196, 0.12, 0.22, { type: 'triangle', gain: 0.08 });
}
export function sfxComplete() {
  buzz([20, 50, 20, 50, 40]);
  const c = ac(); if (!c) return;
  [523, 659, 784, 1047].forEach((f, i) => tone(c, f, i * 0.09, 0.28, { gain: 0.06 }));
}
export function sfxTap() {
  const c = ac(); if (!c) return;
  tone(c, 660, 0, 0.05, { gain: 0.03 });
}
