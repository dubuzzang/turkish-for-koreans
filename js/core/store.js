// 학습 데이터 저장소 (localStorage). 모든 접근은 try/catch — 사생활 보호 모드에서도 앱은 동작.

const KEY = 'merhaba-tr.v1';

export const DEFAULT_SETTINGS = {
  hangul: true,        // 한글 발음 표기
  rate: 0.9,           // 음성 속도
  autoplay: true,      // 단어 자동 재생
  sfx: true,           // 효과음
  vibrate: true,       // 진동
  goal: 40,            // 하루 목표 XP
  newPerDay: 10,       // 하루 새 단어 수(단어 늘리기)
  retention: 0.9,      // 목표 기억률(FSRS)
  theme: 'auto',       // auto | light | dark
  voice: '',           // 선택한 음성 voiceURI
  listening: true,     // 듣기 문제 포함
  speaking: true,      // 말하기 문제 포함(지원 기기)
  onboarded: false,
  purpose: '',
  autoOffline: true,   // 앱으로 설치해 열면 와이파이에서 오프라인 팩 자동 저장
  installHint: true,   // 홈 화면의 "앱으로 설치" 안내
};

function fresh() {
  return {
    v: 1,
    created: Date.now(),
    settings: { ...DEFAULT_SETTINGS },
    lessons: {},                 // lessonId → { done, stars, acc, at, n }
    cards: {},                   // cardId → FSRS 카드
    xp: { total: 0, days: {} },  // 날짜 → XP
    streak: { cur: 0, best: 0, last: '' },
    stats: { days: {} },         // 날짜 → { ok, bad, rev, min }
    mistakes: {},                // 문제 키 → { n, at, ref }
    letters: {},                 // 알파벳 확인 기록
    drills: {},                  // 드릴별 최고 기록
    newDays: {},                 // 날짜 → 새로 배운 단어 수
    talks: {},                   // 회화 연습 기록
  };
}

function migrate(s) {
  const f = fresh();
  if (!s || typeof s !== 'object') return f;
  return {
    ...f,
    ...s,
    settings: { ...f.settings, ...(s.settings || {}) },
    xp: { ...f.xp, ...(s.xp || {}) },
    streak: { ...f.streak, ...(s.streak || {}) },
    stats: { ...f.stats, ...(s.stats || {}) },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) {
    console.warn('저장된 데이터를 불러오지 못했어요', e);
  }
  return fresh();
}

export const state = load();
const listeners = new Set();
let timer = null;

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('저장 실패', e);
  }
}

export function save(immediate = false) {
  clearTimeout(timer);
  if (immediate) write();
  else timer = setTimeout(write, 200);
}

/** 상태 변경 후 호출 — 저장 + 구독자 알림 */
export function commit() {
  save();
  listeners.forEach((fn) => {
    try { fn(state); } catch (e) { console.error(e); }
  });
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => save(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });
  // 다른 탭에서 학습하면 이 탭의 메모리 상태도 맞춰 둔다 (덮어쓰기 방지)
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try {
      const next = migrate(JSON.parse(e.newValue));
      Object.keys(state).forEach((k) => delete state[k]);
      Object.assign(state, next);
      listeners.forEach((fn) => { try { fn(state); } catch (err) { console.error(err); } });
    } catch { /* 무시 */ }
  });
}

// ---------- 날짜 ----------
export function dayKey(offset = 0, base = new Date()) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---------- XP·연속 학습 ----------
export function addXP(n) {
  if (!n) return;
  const k = dayKey();
  state.xp.total += n;
  state.xp.days[k] = (state.xp.days[k] || 0) + n;
  touchStreak();
  commit();
}

function touchStreak() {
  const s = state.streak;
  const today = dayKey();
  if (s.last === today) return;
  s.cur = s.last === dayKey(-1) ? s.cur + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best || 0, s.cur);
}

export function streakNow() {
  const s = state.streak;
  return s.last === dayKey() || s.last === dayKey(-1) ? s.cur : 0;
}
export const xpToday = () => state.xp.days[dayKey()] || 0;

// ---------- 정답 통계·약점 ----------
export function recordAnswer(ok, key, ref) {
  const k = dayKey();
  const d = (state.stats.days[k] ||= { ok: 0, bad: 0, rev: 0 });
  if (ok) d.ok++; else d.bad++;
  if (key) {
    const m = state.mistakes[key];
    if (!ok) state.mistakes[key] = { n: (m?.n || 0) + 1, at: Date.now(), ref: ref ?? m?.ref };
    else if (m) {
      m.n -= 1;
      if (m.n <= 0) delete state.mistakes[key];
    }
  }
  save();
}

export function recordReview() {
  const k = dayKey();
  const d = (state.stats.days[k] ||= { ok: 0, bad: 0, rev: 0 });
  d.rev = (d.rev || 0) + 1;
}

// ---------- 설정 ----------
export function setSetting(key, value) {
  state.settings[key] = value;
  commit();
}

// ---------- 백업 ----------
export function exportJSON() {
  return JSON.stringify({ app: 'merhaba-tr', exported: new Date().toISOString(), data: state }, null, 1);
}

export function importJSON(text) {
  const obj = JSON.parse(text);
  const data = obj && obj.app === 'merhaba-tr' ? obj.data : obj;
  if (!data || typeof data !== 'object' || !data.settings) throw new Error('올바른 백업 파일이 아니에요');
  const next = migrate(data);
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, next);
  save(true);
  commit();
}

export function resetAll() {
  const keep = { ...state.settings, onboarded: false };
  const next = fresh();
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, next, { settings: { ...next.settings, ...keep, onboarded: false } });
  save(true);
  commit();
}
