// 앱 셸 · 해시 라우터
import { state, subscribe, streakNow } from './core/store.js';
import { h, icon, closeAllSheets, whenHistoryIdle, toast } from './core/ui.js';
import { dueCount } from './core/deck.js';
import { stopSpeaking } from './core/tts.js';
import home from './views/home.js';
import learn from './views/learn.js';
import lesson from './views/lesson.js';
import review from './views/review.js';
import practice from './views/practice.js';
import drill from './views/drill.js';
import words from './views/words.js';
import alphabet from './views/alphabet.js';
import settings from './views/settings.js';
import grammar from './views/grammar.js';
import talk from './views/talk.js';
import phrases from './views/phrases.js';
import stats from './views/stats.js';
import install from './views/install.js';
import move from './views/move.js';
import './views/wordforms.js';
import { renderOnboarding } from './views/onboarding.js';
import { autoOffline, onOfflineChange, offlineJob } from './core/offline.js';

const ROUTES = { home, learn, lesson, review, practice, drill, words, alphabet, settings, grammar, talk, phrases, stats, install, move };
const TABS = [
  { id: 'home', label: '홈', icon: 'home' },
  { id: 'learn', label: '학습', icon: 'learn' },
  { id: 'review', label: '복습', icon: 'cards' },
  { id: 'practice', label: '연습', icon: 'target' },
  { id: 'words', label: '단어장', icon: 'words' },
];

const app = document.getElementById('app');
const titleEl = h('div', { class: 'topbar-title' });
const streakEl = h('a', { class: 'pill streak', href: '#/home', 'aria-label': '연속 학습' });
const topbar = h('header', { class: 'topbar' },
  titleEl,
  h('div', { class: 'topbar-actions' },
    streakEl,
    h('a', { class: 'icon-btn', href: '#/settings', 'aria-label': '설정' }, icon('settings', 22)),
  ),
);
const viewEl = h('main', { class: 'view', id: 'view' });
const tabEls = new Map();
const tabbar = h('nav', { class: 'tabbar', 'aria-label': '주요 메뉴' }, TABS.map((t) => {
  const badge = h('span', { class: 'tab-badge', hidden: true });
  const a = h('a', { class: 'tab', href: `#/${t.id}` }, icon(t.icon, 24), h('span', null, t.label), badge);
  tabEls.set(t.id, { a, badge });
  return a;
}));

export function go(hash) {
  whenHistoryIdle().then(() => {
    if (location.hash === hash) route();
    else location.hash = hash;
  });
}
window.__go = go;

function applyTheme() {
  const t = state.settings.theme;
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
  const dark = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#0c1419' : '#f4f7f8'));
}

function refreshChrome() {
  const s = streakNow();
  streakEl.replaceChildren(icon('flame', 18), h('span', null, String(s)));
  streakEl.classList.toggle('off', s === 0);
  streakEl.title = `${s}일 연속 학습`;
  const due = dueCount();
  const rb = tabEls.get('review').badge;
  rb.hidden = due === 0;
  rb.textContent = due > 99 ? '99+' : String(due);
}

let cleanup = null;
let current = '';

function route() {
  stopSpeaking();
  closeAllSheets();
  document.querySelectorAll('.confetti').forEach((c) => c.remove());
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.error(e); } }
  cleanup = null;
  // 기록 옮기기 링크는 첫 실행 안내보다 먼저 (새로 설치한 앱으로 기록을 보낼 때)
  if (!state.settings.onboarded && !/^#\/move\//.test(location.hash)) {
    document.body.classList.add('immersive');
    app.replaceChildren(viewEl);
    viewEl.replaceChildren();
    renderOnboarding(viewEl, () => { mountShell(); route(); });
    return;
  }
  mountShell();
  const [name, ...params] = (location.hash.replace(/^#\/?/, '') || 'home').split('/').map(decodeURIComponent);
  const view = ROUTES[name] || home;
  current = name;
  document.body.classList.toggle('immersive', !!(typeof view.immersive === 'function' ? view.immersive(params) : view.immersive));
  for (const [id, t] of tabEls) {
    t.a.classList.toggle('active', id === view.tab);
    if (id === view.tab) t.a.setAttribute('aria-current', 'page'); else t.a.removeAttribute('aria-current');
  }
  const title = typeof view.title === 'function' ? view.title(params) : view.title;
  titleEl.replaceChildren(title ? title : h('span', { class: 'logo' }, 'Merhaba'));
  document.title = title ? `${title} · Merhaba` : 'Merhaba · 한국인을 위한 튀르키예어';
  viewEl.replaceChildren();
  window.scrollTo(0, 0);
  refreshChrome();
  try {
    cleanup = view.render(viewEl, params, { go });
  } catch (e) {
    console.error(e);
    viewEl.replaceChildren(h('div', { class: 'empty' }, h('div', { class: 'e-emoji' }, '😵'), h('p', null, '화면을 그리는 중 문제가 생겼어요.'), h('a', { class: 'btn btn-soft mt-12', href: '#/home' }, '홈으로')));
  }
}

let shellMounted = false;
function mountShell() {
  if (shellMounted) return;
  shellMounted = true;
  app.replaceChildren(topbar, viewEl, tabbar);
}

applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
let lastTheme = state.settings.theme;
subscribe(() => {
  if (state.settings.theme !== lastTheme) { lastTheme = state.settings.theme; applyTheme(); }
  if (shellMounted) refreshChrome();
});
window.addEventListener('hashchange', route);
route();

// ---------- 오프라인(PWA) ----------
// 앱으로 설치해 열면 와이파이에서 녹음·글꼴을 자동 저장하고, 진행률을 작은 칩으로 보여 준다
const chip = h('a', { class: 'offline-chip', href: '#/install', hidden: true, 'aria-live': 'polite' });
document.body.append(chip);
onOfflineChange(() => {
  const job = offlineJob();
  chip.hidden = !job?.auto;
  if (job?.auto) chip.textContent = `⬇️ 오프라인 저장 중 ${job.total ? Math.round((job.done / job.total) * 100) : 0}%`;
});
setTimeout(() => {
  autoOffline().then((r) => {
    if (r !== 'started') return;
    toast('와이파이에서 오프라인 자료를 저장하고 있어요 — 끝나면 데이터 없이 학습할 수 있어요');
    offlineJob()?.promise.then((res) => {
      if (res.ok) toast('오프라인 준비 완료 🎉 이제 데이터 없이 학습할 수 있어요', 'ok');
      else if (!res.stopped) toast('일부를 저장하지 못했어요 — 설정 → 앱 설치·오프라인에서 다시 받을 수 있어요', 'bad');
    });
  }).catch(() => {});
}, 2500);

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__installPrompt = e; });
window.addEventListener('appinstalled', () => { window.__installPrompt = null; toast('앱으로 설치됐어요! 홈 화면에서 바로 열 수 있어요.', 'ok'); });

const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
if ('serviceWorker' in navigator && (location.protocol === 'https:' ? !isLocal : isLocal && /[?&]sw=1/.test(location.search))) {
  // 새 버전은 서비스 워커가 바로 적용한다. 처음 설치될 때는 새로 고칠 필요가 없고,
  // 레슨·연습 중이면 끊지 않고 다음 화면으로 넘어갈 때 새로 고친다.
  let refreshing = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || !hadController) return;
    refreshing = true;
    if (document.body.classList.contains('immersive')) {
      toast('새 버전이 준비됐어요 — 이 학습을 마치면 적용돼요');
      window.addEventListener('hashchange', () => location.reload(), { once: true });
    } else location.reload();
  });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.waiting?.postMessage('SKIP_WAITING'); // 예전 버전이 남긴 대기 중인 워커
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});
}
