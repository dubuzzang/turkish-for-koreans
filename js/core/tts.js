// 튀르키예어 발음 재생
// ① 녹음 음성: 미리 만들어 둔 AI 튀르키예어 음성 파일(audio/<id>.mp3) — 앱의 거의 모든 단어·문장
// ② 기기 음성: 녹음이 없는 문장(문법 드릴의 활용형 등)만, 기기에 튀르키예어(tr-TR) 음성이 있을 때 Web Speech로 읽는다.
//    튀르키예어가 아닌 음성으로 대신 읽지는 않는다(엉터리 발음이 되므로).
import { state } from './store.js';
import { audioId } from './audiokey.js';

const inBrowser = typeof window !== 'undefined';
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());
/** 음성 상태(녹음 목록·기기 음성)가 바뀌면 알림. 해제 함수를 돌려준다 */
export function onVoicesChanged(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------- ① 녹음 음성 ----------
export const AUDIO_DIR = 'audio/';
export const AUDIO_CACHE = 'merhaba-audio-v2'; // 녹음을 새로 만들면(AUDIO_REV) 함께 올린다 — 예전 보관본은 서비스 워커가 지운다
let index = null; // Set<id> — 불러오기 전에는 null
let indexBytes = 0;
let indexPromise = null;

export function loadAudioIndex() {
  if (!indexPromise) {
    indexPromise = (inBrowser ? fetch(`${AUDIO_DIR}index.json`) : Promise.reject(new Error('no window')))
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((j) => {
        index = new Set(j?.ids || []);
        indexBytes = j?.bytes || 0;
        if (!j) indexPromise = null; // 못 받았으면 다음에 다시 시도
        notify();
        return index;
      });
  }
  return indexPromise;
}
if (inBrowser) {
  loadAudioIndex();
  window.addEventListener('online', () => { if (!index?.size) loadAudioIndex(); });
}

export const recordingCount = () => index?.size ?? 0;
export const recordingBytes = () => indexBytes;
export const recordingIds = () => [...(index || [])];
export const audioUrl = (id) => `${AUDIO_DIR}${id}.mp3`;

/** 이 문장의 녹음 파일 id (원하는 목소리가 없으면 다른 목소리) */
export function recordingId(text, voice = 'f') {
  if (!index || !text) return null;
  for (const v of voice === 'm' ? ['m', 'f'] : ['f', 'm']) {
    const id = audioId(text, v);
    if (id && index.has(id)) return id;
  }
  return null;
}
export const hasRecording = (text, voice) => !!recordingId(text, voice);

let player = null;
function getPlayer() {
  if (!player && inBrowser) {
    player = new Audio();
    player.preload = 'auto';
    player.preservesPitch = true;
    player.webkitPreservesPitch = true;
    player.mozPreservesPitch = true;
  }
  return player;
}
// iOS: 첫 터치 때 재생기를 한 번 깨워 두면 이후 자동 재생(onShow)도 막히지 않는다
const SILENCE = 'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
if (inBrowser) {
  // 사용자 활성화로 인정되는 이벤트: 터치는 pointerup·touchend, 마우스는 mousedown, 키보드는 keydown
  const EVENTS = ['pointerup', 'touchend', 'mousedown', 'keydown'];
  const unlock = () => {
    EVENTS.forEach((ev) => window.removeEventListener(ev, unlock, true));
    const p = getPlayer();
    if (p && !p.src) {
      p.src = SILENCE;
      p.play().catch(() => {});
    }
  };
  EVENTS.forEach((ev) => window.addEventListener(ev, unlock, true));
}

/** 설정 속도(rate, 기본 0.9 = 자연스러운 속도)를 녹음 재생 배속으로 */
const playbackRate = (rate, slow) => {
  const r = (rate ?? state.settings.rate ?? 0.9) / 0.9;
  return Math.max(0.5, Math.min(1.4, slow ? r * 0.7 : r));
};

/** 녹음 파일 재생. 끝까지 → true, 실패 → false, 다른 재생·정지로 끊김 → 'stopped' */
function playRecording(id, { slow, rate }, my) {
  return new Promise((resolve) => {
    const p = getPlayer();
    if (!p) return resolve(false);
    let done = false, started = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      p.removeEventListener('playing', onPlaying);
      p.removeEventListener('ended', onEnd);
      p.removeEventListener('error', onErr);
      p.removeEventListener('pause', onPause);
      clearTimeout(timer);
      resolve(my === seq ? ok : 'stopped');
    };
    // 이전 재생을 멈출 때 생긴 pause 이벤트가 늦게 도착해도 무시하도록, 실제로 재생이 시작된 뒤의 pause만 본다
    const onPlaying = () => { started = true; };
    const onEnd = () => finish(true);
    const onErr = () => finish(false);
    const onPause = () => { if (started && !p.ended) finish(false); };
    p.addEventListener('playing', onPlaying);
    p.addEventListener('ended', onEnd);
    p.addEventListener('error', onErr);
    p.addEventListener('pause', onPause);
    const timer = setTimeout(() => finish(false), 20000);
    const r = playbackRate(rate, slow);
    p.src = audioUrl(id);
    p.defaultPlaybackRate = r;
    p.playbackRate = r;
    p.play().catch(() => finish(false));
  });
}

// ---------- ② 기기 음성 (Web Speech) ----------
const synth = inBrowser && 'speechSynthesis' in window ? window.speechSynthesis : null;
let voices = [];
let chosen = null;

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
  voices = (synth.getVoices() || []).filter((v) => /^tr([-_]|$)/i.test(v.lang || ''));
  const pref = state.settings.voice;
  chosen = voices.find((v) => v.voiceURI === pref) || [...voices].sort((a, b) => score(b) - score(a))[0] || null;
  notify();
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
export function setVoice(uri) {
  state.settings.voice = uri || '';
  refresh();
}

function speakDevice(text, { slow, rate }, my) {
  return new Promise((resolve) => {
    if (!synth || !chosen) return resolve(false);
    const clean = String(text).replace(/[—–]/g, ',').replace(/\s+/g, ' ').trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = chosen.lang || 'tr-TR';
    u.voice = chosen;
    const base = rate ?? state.settings.rate ?? 0.9;
    u.rate = slow ? Math.max(0.45, base * 0.62) : base;
    let done = false;
    const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
    u.onend = () => finish(true);
    u.onerror = () => finish(false);
    setTimeout(() => finish(false), 8000 + clean.length * 160);
    try {
      if (synth.speaking || synth.pending) {
        synth.cancel();
        setTimeout(() => { if (my === seq) synth.speak(u); else finish(false); }, 70);
      } else synth.speak(u);
      if (synth.paused) synth.resume();
    } catch {
      finish(false);
    }
  });
}

// ---------- 공통 ----------
/** 녹음 목록을 아직 못 불러왔으면 잠깐 기다린다 (첫 화면의 자동 재생용) */
const indexReady = () => (index ? Promise.resolve() : Promise.race([loadAudioIndex(), new Promise((r) => setTimeout(r, 2500))]));

/** 들려줄 방법이 있는 문장인가 (녹음 목록을 불러오는 중이면 있다고 본다) */
export function canSpeak(text, voice) {
  if (!text) return false;
  if (!index) return true;
  return hasRecording(text, voice) || hasTurkishVoice();
}

/** 듣기 문제를 낼 수 있는가 — 녹음 음성이 있거나 기기에 튀르키예어 음성이 있으면 */
export const speechAvailable = () => !index || index.size > 0 || hasTurkishVoice();

let seq = 0;
/**
 * 튀르키예어를 읽는다. 끝까지 들려주면 true, 들려줄 수 없거나 중단되면 false로 resolve
 * @param {{slow?: boolean, rate?: number, voice?: 'f'|'m'}} opts
 */
export function speak(text, opts = {}) {
  if (!text) return Promise.resolve(false);
  stopSpeaking();
  const my = seq;
  // 목록이 이미 있으면 바로 재생(터치 이벤트 안에서 play()를 불러야 iOS가 막지 않는다)
  if (index) return speakNow(text, opts, my);
  return indexReady().then(() => (my === seq ? speakNow(text, opts, my) : false));
}

async function speakNow(text, { slow = false, rate, voice } = {}, my) {
  const id = recordingId(text, voice);
  if (!id && inBrowser) (window.__audioMiss ||= new Set()).add(String(text)); // 자동 점검용: 녹음이 없는 문장
  if (id) {
    const ok = await playRecording(id, { slow, rate }, my);
    if (ok === true) return true;
    if (ok === 'stopped' || my !== seq) return false;
    // 파일을 못 받았을 때(오프라인 등)는 기기 음성으로
  }
  return speakDevice(text, { slow, rate }, my);
}

export function stopSpeaking() {
  seq++;
  if (player && !player.paused) {
    try { player.pause(); } catch { /* 무시 */ }
  }
  try { synth?.cancel(); } catch { /* 무시 */ }
}

/** 곧 들려줄 문장의 녹음 파일을 미리 받아 둔다 (서비스 워커가 보관) */
export function prefetchSpeech(texts) {
  if (!inBrowser || navigator.connection?.saveData) return;
  indexReady().then(() => {
    const ids = [...new Set(texts.map((t) => (Array.isArray(t) ? recordingId(t[0], t[1]) : recordingId(t))).filter(Boolean))].slice(0, 80);
    let i = 0;
    const next = () => {
      if (i >= ids.length) return;
      fetch(audioUrl(ids[i++])).catch(() => {}).finally(next);
    };
    for (let k = 0; k < 3; k++) next();
  });
}
