// DOM 도우미 · 아이콘 · 토스트 · 바텀시트 · 공통 위젯
import { speak, canSpeak } from './tts.js';
import { toHangul } from './hangul.js';
import { state } from './store.js';

export function h(tag, props, ...kids) {
  if (props != null && (typeof props !== 'object' || props instanceof Node || Array.isArray(props))) {
    kids.unshift(props);
    props = null;
  }
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value') el.value = v;
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  appendKids(el, kids);
  return el;
}

function appendKids(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false || k === true) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}

export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
/** null/false를 건너뛰는 replaceChildren */
export function setKids(el, ...kids) {
  clear(el);
  appendKids(el, kids);
  return el;
}
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- 아이콘 (24×24, stroke) ----------
const ICONS = {
  home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v10.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9"/>',
  learn: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19a1 1 0 0 1 1 1v14H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h14v-4"/><path d="M8.5 7.5h7M8.5 11.5h5"/>',
  cards: '<rect x="3" y="6.5" width="13" height="14.5" rx="2.5"/><path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V16"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
  words: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="m9.2 14.5 2.6-6.5 2.6 6.5M10.2 12.4h3.2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  volume: '<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  slow: '<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/>',
  mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/>',
  flame: '<path d="M12.3 2.5c.9 3.1-.9 5-2.3 6.6C8.6 10.7 7 12.4 7 15.2A5 5 0 0 0 12 20.5a5 5 0 0 0 5-5.3c0-2.2-1.1-3.9-2.2-5.2.2 1.5-.3 2.7-1.4 3.4.5-4-.7-7.9-1.1-10.9z" fill="currentColor" stroke="none"/>',
  check: '<path d="M5 12.5 10 17.5 19.5 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  'chev-right': '<path d="m9 5 7 7-7 7"/>',
  'chev-left': '<path d="m15 5-7 7 7 7"/>',
  star: '<path d="m12 2.8 2.8 5.7 6.3.9-4.55 4.43 1.07 6.27L12 17.1l-5.62 2.96 1.07-6.27L2.9 9.4l6.3-.9z" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
  bulb: '<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.7.6 1 1.3 1 2.4h6c0-1.1.3-1.8 1-2.4a6.5 6.5 0 0 0-4-11.6z"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4.5V11h-6.5"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  chart: '<path d="M3.5 3.5v17h17"/><path d="M8 16v-4M12.5 16V8M17 16v-6"/>',
  download: '<path d="M12 3.5v12M7 10.5l5 5 5-5M4 20.5h16"/>',
  upload: '<path d="M12 20.5v-12M7 13.5l5-5 5 5M4 3.5h16"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  zap: '<path d="M13 2.5 4 14h7l-1 7.5L19 10h-7z" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  headphones: '<path d="M3.5 18v-6a8.5 8.5 0 0 1 17 0v6"/><path d="M20.5 19a2 2 0 0 1-2 2h-1v-6h3zM3.5 19a2 2 0 0 0 2 2h1v-6h-3z"/>',
  message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  hint: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17v.5"/>',
  back: '<path d="M10 6 4 12l6 6M4 12h16"/>',
};

export function icon(name, size = 22) {
  const span = document.createElement('span');
  span.className = 'ico';
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  return span;
}

// ---------- 무작위 ----------
export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const sample = (arr, n, rng) => shuffle(arr, rng).slice(0, n);
export const pick = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 토스트 ----------
let toastWrap = null;
export function toast(msg, type = '', ms = 2400) {
  if (!toastWrap) {
    toastWrap = h('div', { class: 'toast-wrap', role: 'status', 'aria-live': 'polite' });
    document.body.append(toastWrap);
  }
  // 같은 안내가 연달아 쌓이지 않게
  if ([...toastWrap.children].some((c) => c.textContent === msg && !c.classList.contains('out'))) return;
  const t = h('div', { class: `toast ${type}` }, msg);
  toastWrap.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, ms);
}

/** 하단 알림 막대 (버튼 1개) */
export function actionBar(msg, label, onClick) {
  document.querySelector('.action-bar')?.remove();
  const bar = h('div', { class: 'action-bar', role: 'status' },
    h('span', { class: 'grow' }, msg),
    h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: () => { bar.remove(); onClick(); } }, label),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': '닫기', onclick: () => bar.remove() }, icon('x', 18)),
  );
  document.body.append(bar);
  return bar;
}

// ---------- 바텀 시트 ----------
// 열면 history에 한 칸을 쌓아, 휴대폰 '뒤로' 버튼이 화면 이동 대신 시트를 닫게 한다.
const sheetStack = [];
let skipPop = 0;
let idleWaiters = [];
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (skipPop > 0) {
      skipPop--;
      if (!skipPop) { idleWaiters.forEach((f) => f()); idleWaiters = []; }
      return;
    }
    const top = sheetStack[sheetStack.length - 1];
    if (top) top.close(true);
  });
}
/** 시트를 닫으며 보낸 history.back()이 끝난 뒤에 화면을 이동하기 위한 대기 */
export function whenHistoryIdle() {
  if (!skipPop) return Promise.resolve();
  return new Promise((res) => {
    idleWaiters.push(res);
    setTimeout(() => { if (skipPop) { skipPop = 0; idleWaiters.forEach((f) => f()); idleWaiters = []; } }, 400);
  });
}
/** 라우트가 바뀔 때 열린 시트 정리 */
export function closeAllSheets() {
  while (sheetStack.length) sheetStack[sheetStack.length - 1].close(true);
}

export function openSheet({ title, body, actions = [], onClose, label } = {}) {
  const prevFocus = document.activeElement;
  let closed = false;
  const handle = {};
  const close = (fromHistory = false) => {
    if (closed) return;
    closed = true;
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    const i = sheetStack.indexOf(handle);
    if (i >= 0) sheetStack.splice(i, 1);
    if (!fromHistory && history.state?.sheet) { skipPop++; history.back(); }
    onClose?.();
    prevFocus?.focus?.({ preventScroll: true });
  };
  handle.close = close;
  try { history.pushState({ sheet: true }, ''); } catch { /* 무시 */ }
  sheetStack.push(handle);
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const sheetEl = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': label || title || '' },
    h('div', { class: 'sheet-grip' }),
    title ? h('div', { class: 'sheet-head' }, h('h2', null, title), h('button', { class: 'icon-btn', 'aria-label': '닫기', onclick: () => close() }, icon('x'))) : null,
    body,
    actions.length ? h('div', { class: 'sheet-actions' }, actions.map((a) => h('button', {
      class: `btn ${a.cls || 'btn-soft'}`,
      onclick: async () => { const keep = await a.onClick?.(); if (!keep) close(); },
    }, a.label))) : null,
  );
  const backdrop = h('div', { class: 'backdrop', onclick: (e) => { if (e.target === backdrop) close(); } }, sheetEl);
  // 시트 안의 링크로 다른 화면에 갈 때는 history 정리 없이 닫기
  sheetEl.addEventListener('click', (e) => { if (e.target.closest('a[href^="#/"]')) close(true); });
  document.body.append(backdrop);
  document.addEventListener('keydown', onKey);
  setTimeout(() => sheetEl.querySelector('button, [tabindex], input')?.focus?.({ preventScroll: true }), 50);
  return { close, el: sheetEl };
}

export function confirmSheet(message, { ok = '확인', cancel = '취소', danger = false, title = '' } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    openSheet({
      title,
      body: h('p', { class: 'text-2', style: { fontSize: '16px' } }, message),
      actions: [
        { label: cancel, cls: 'btn-outline', onClick: () => { answered = true; resolve(false); } },
        { label: ok, cls: danger ? 'btn-bad' : 'btn-primary', onClick: () => { answered = true; resolve(true); } },
      ],
      onClose: () => { if (!answered) resolve(false); },
    });
  });
}

// ---------- 발음 버튼·튀르키예어 표시 ----------
export function speakBtn(text, { slow = false, size = '', label, voice } = {}) {
  const b = h('button', {
    class: `speak-btn ${size} ${slow ? 'slow' : ''}`,
    type: 'button',
    'aria-label': label || (slow ? '천천히 듣기' : '듣기'),
    title: slow ? '천천히 듣기' : '듣기',
  }, icon(slow ? 'slow' : 'volume', size === 'xl' ? (slow ? 26 : 36) : size === 'sm' ? 18 : 22));
  b.addEventListener('click', async (e) => {
    e.stopPropagation();
    const t = typeof text === 'function' ? text() : text;
    if (!canSpeak(t, voice)) {
      toast('이 표현은 녹음 음성이 없어요 — 기기에 튀르키예어 음성을 설치하면 들을 수 있어요');
      return;
    }
    b.classList.add('playing');
    await speak(t, { slow, voice });
    b.classList.remove('playing');
  });
  return b;
}

/** 설정에 따라 한글 발음 표기 */
export function hangulEl(text, cls = 'hangul') {
  if (!state.settings.hangul || !text) return null;
  return h('div', { class: cls }, toHangul(text));
}

/** .tr 요소를 누르면 읽어 주기 */
export function tapToSpeak(root) {
  root.addEventListener('click', (e) => {
    const el = e.target.closest('.tr');
    if (el && root.contains(el)) speak(el.textContent.replace(/[()]/g, ''));
  });
  return root;
}

// ---------- 진행 링 ----------
export function ring(value, { size = 64, stroke = 7, label = null } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const wrap = h('div', { class: 'ring', style: { width: `${size}px`, height: `${size}px` } });
  wrap.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/><circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}"/></svg>`;
  if (label) wrap.append(h('div', { class: 'ring-label' }, label));
  return wrap;
}

export function bar(value, cls = '') {
  return h('div', { class: `bar ${cls}` }, h('i', { style: { width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` } }));
}

export function stars(n, max = 3) {
  return h('span', { class: 'stars', 'aria-label': `별 ${n}개` }, Array.from({ length: max }, (_, i) => h('span', { class: i < n ? 'on' : '' }, icon('star', 15))));
}

export function confetti() {
  const colors = ['#0e9f9a', '#f0a020', '#e5484d', '#7356f0', '#2b72e8', '#15a34a'];
  const box = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  for (let i = 0; i < 70; i++) {
    box.append(h('i', {
      style: {
        left: `${Math.random() * 100}%`,
        background: colors[i % colors.length],
        animationDuration: `${1.6 + Math.random() * 1.6}s`,
        animationDelay: `${Math.random() * 0.4}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      },
    }));
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 3600);
}

/** 파일 저장 */
export function downloadText(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}

export const POS_LABEL = {
  n: '명사', v: '동사', adj: '형용사', adv: '부사', pron: '대명사', num: '수사',
  int: '감탄사', phr: '표현', post: '후치사', conj: '접속사', q: '의문사',
};
