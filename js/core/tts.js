// 튀르키예어 음성 합성 (Web Speech API). 기기에 설치된 tr-TR 음성 중 가장 자연스러운 것을 고른다.
import { state } from './store.js';

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
let voices = [];
let chosen = null;
const listeners = new Set();

function score(v) {
  const n = `${v.name} ${v.voiceURI}`.toLowerCase();
  let s = 0;
  if (/natural|neural|online|premium|enhanced|wavenet/.test(n)) s += 6;
  if (/google/.test(n)) s += 3;
  if (/yelda|emel|ahmet|filiz|seda|cem|tolga|zeynep|mehmet/.test(n)) s += 2;
  if (/^tr[-_]tr/i.test(v.lang)) s += 1;
  return s;
}

function refresh() {
  if (!synth) return;
  const all = synth.getVoices() || [];
  voices = all.filter((v) => /^tr([-_]|$)/i.test(v.lang || ''));
  const pref = state.settings.voice;
  chosen = voices.find((v) => v.voiceURI === pref) || [...voices].sort((a, b) => score(b) - score(a))[0] || null;
  listeners.forEach((fn) => fn());
}

if (synth) {
  refresh();
  if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refresh);
  else synth.onvoiceschanged = refresh;
  setTimeout(refresh, 400);
  setTimeout(refresh, 1500);
}

export const ttsSupported = !!synth;
export const trVoices = () => voices;
export const hasTurkishVoice = () => voices.length > 0;
export const currentVoice = () => chosen;
export function onVoicesChanged(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function setVoice(uri) {
  state.settings.voice = uri || '';
  refresh();
}

let seq = 0;
/** 텍스트를 읽는다. 끝나면 true, 실패·중단되면 false로 resolve */
export function speak(text, { slow = false, rate } = {}) {
  return new Promise((resolve) => {
    if (!synth || !text) return resolve(false);
    const clean = String(text).replace(/[—–]/g, ',').replace(/\s+/g, ' ').trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'tr-TR';
    if (chosen) u.voice = chosen;
    const base = rate ?? state.settings.rate ?? 0.9;
    u.rate = slow ? Math.max(0.45, base * 0.62) : base;
    u.pitch = 1;
    const my = ++seq;
    let done = false;
    const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
    u.onend = () => finish(true);
    u.onerror = () => finish(false);
    setTimeout(() => finish(false), 8000 + clean.length * 160);
    try {
      if (synth.speaking || synth.pending) {
        synth.cancel();
        setTimeout(() => { if (my === seq) synth.speak(u); else finish(false); }, 70);
      } else {
        synth.speak(u);
      }
      if (synth.paused) synth.resume();
    } catch {
      finish(false);
    }
  });
}

export function stopSpeaking() {
  seq++;
  try { synth?.cancel(); } catch { /* 무시 */ }
}
