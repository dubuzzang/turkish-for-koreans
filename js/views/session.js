// 공통 학습 세션 진행기: 진행 막대, 확인/계속 버튼, 정답 피드백, 틀린 문제 다시 출제
import { h, icon, pick, confirmSheet, speakBtn, hangulEl } from '../core/ui.js';
import { RENDERERS, diffView } from './exercises.js';
import { sfxCorrect, sfxWrong } from '../core/sfx.js';
import { speak, stopSpeaking, canSpeak } from '../core/tts.js';
import { stopListening } from '../core/stt.js';
import { recordAnswer } from '../core/store.js';

const PRAISE = [['Harika!', '훌륭해요!'], ['Çok iyi!', '아주 좋아요!'], ['Süper!', '최고예요!'], ['Aferin!', '잘했어요!'], ['Mükemmel!', '완벽해요!'], ['Bravo!', '브라보!'], ['Doğru!', '정답이에요!']];
const COMFORT = [['Olsun!', '괜찮아요, 다시 나와요'], ['Bir daha!', '한 번 더 해 봐요'], ['Az kaldı!', '거의 다 왔어요']];
const INFO_TYPES = new Set(['tip', 'intro', 'grammar', 'speak']);
const SPEAK_ON_OK = new Set(['tiles', 'typeSent', 'typeWord', 'listenSent', 'choice']);

export function runSession(root, cfg) {
  const { steps, renderers = {}, onFinish, onExit, requeue = true, confirmExit = true, showCount = false } = cfg;
  const R = { ...RENDERERS, ...renderers };
  const queue = steps.map((s, i) => ({ ...s, _id: i }));
  let done = 0;
  const first = new Map();
  const wrongWords = new Set();
  const started = Date.now();
  let cur = null, curR = null, phase = 'answer', lastResult = null, alive = true;

  const barI = h('i', { style: { width: '0%' } });
  const count = h('div', { class: 'stage-count' });
  const closeBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': '그만하기' }, icon('x', 26));
  const head = h('div', { class: 'stage-head' }, closeBtn, h('div', { class: 'bar', role: 'progressbar', 'aria-label': '진행률' }, barI), count);
  const body = h('div', { class: 'stage-body' });
  const fb = h('div', { class: 'fb', 'aria-live': 'polite' });
  const extra = h('div');
  const mainBtn = h('button', { class: 'btn btn-primary btn-lg btn-block', type: 'button' }, '확인');
  const skipBtn = h('button', { class: 'btn btn-outline btn-lg', type: 'button', style: { flex: '0 0 auto' } }, '모르겠어요');
  const btnRow = h('div', { class: 'btn-row' }, skipBtn, mainBtn);
  const foot = h('div', { class: 'stage-foot' }, h('div', { class: 'stage-foot-inner' }, fb, extra, btnRow));
  root.append(h('div', { class: 'stage' }, head, body, foot));

  let mainAction = null;
  mainBtn.addEventListener('click', () => mainAction?.());
  skipBtn.addEventListener('click', () => {
    if (phase !== 'answer' || !curR?.check) return;
    const res = curR.check();
    onResult({ ...res, ok: false, skipped: true });
  });

  function setMain(label, cls, enabled, action) {
    mainBtn.textContent = label;
    mainBtn.className = `btn ${cls} btn-lg btn-block`;
    mainBtn.disabled = !enabled;
    mainAction = action;
  }

  function progress() {
    const p = done / Math.max(1, done + queue.length + (cur && phase !== 'gone' ? 0 : 0));
    barI.style.width = `${Math.round(p * 100)}%`;
    count.textContent = showCount ? `${done}/${done + queue.length + (cur ? 1 : 0)}` : '';
  }

  const api = {
    submit: (res) => onResult(res),
    setReady: (v) => { if (phase === 'answer') mainBtn.disabled = !v; },
    trigger: () => { if (phase === 'answer' && !mainBtn.disabled) mainBtn.click(); },
    setExtra: (...nodes) => extra.replaceChildren(...nodes),
    hideButtons: () => { btnRow.hidden = true; },
    setMain: (label, action, cls = 'btn-primary') => { btnRow.hidden = false; skipBtn.hidden = true; foot.hidden = false; setMain(label, cls, true, action); },
    /** 피드백 없이 다음으로 (플래시카드 등) — res.requeue면 곧 다시 */
    advance: (res = {}) => {
      if (!alive) return;
      if (res.skip) { done++; next(); return; }
      record(res);
      if (res.requeue) queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 3)), 0, { ...cur, retry: (cur.retry || 0) + 1 });
      else done++;
      next();
    },
  };

  function record(res) {
    if (!first.has(cur._id)) first.set(cur._id, !!res.ok && !res.mistakes);
    if (cur.w && res.ok === false) wrongWords.add(cur.w.id);
    (res.wrongWords || []).forEach((id) => wrongWords.add(id));
    if (cur.key && res.ok !== undefined) recordAnswer(!!res.ok, cur.key, cur.w ? { w: cur.w.id } : cur.ref);
  }

  function next() {
    stopSpeaking();
    if (!alive) return;
    if (!queue.length) return finish();
    cur = queue.shift();
    phase = 'answer';
    lastResult = null;
    foot.className = 'stage-foot';
    foot.hidden = false;
    fb.replaceChildren();
    extra.replaceChildren();
    btnRow.hidden = false;
    curR = R[cur.type](cur, api);
    window.__merhabaStep = cur; // 자동 테스트용
    body.replaceChildren(curR.el);
    window.scrollTo(0, 0);
    if (curR.info) {
      skipBtn.hidden = true;
      setMain('계속', 'btn-primary', true, () => { done++; next(); });
    } else if (curR.custom) {
      // 렌더러가 버튼을 직접 관리
    } else if (curR.check) {
      skipBtn.hidden = false;
      setMain('확인', 'btn-primary', false, () => { if (phase === 'answer') onResult(curR.check()); });
    } else {
      foot.hidden = true; // 객관식·짝맞추기: 선택 즉시 채점
    }
    progress();
    curR.onShow?.();
  }

  function onResult(res) {
    if (phase !== 'answer' || !alive) return;
    phase = 'feedback';
    lastResult = res;
    record(res);
    if (res.ok) sfxCorrect(); else sfxWrong();
    if (res.speakText && (!res.ok || SPEAK_ON_OK.has(cur.type))) setTimeout(() => speak(res.speakText, { voice: res.voice }), res.ok ? 150 : 350);
    showFeedback(res);
  }

  function showFeedback(res) {
    foot.hidden = false;
    foot.className = `stage-foot ${res.ok ? 'ok' : 'bad'}`;
    btnRow.hidden = false;
    skipBtn.hidden = true;
    const [tr, ko] = pick(res.ok ? PRAISE : COMFORT);
    const kids = [
      h('div', { class: 'fb-title' }, icon(res.ok ? 'check' : 'info', 22), res.title || (res.ok ? ko : res.skipped ? '정답을 확인해요' : '아쉬워요!'), h('span', { class: 'praise-tr' }, res.ok ? tr : '')),
    ];
    if (res.answer && (!res.ok || res.mine || SPEAK_ON_OK.has(cur.type))) {
      kids.push(h('div', { class: 'fb-body' },
        !res.ok ? h('div', { class: 'small text-2' }, '정답') : null,
        h('div', { class: 'fb-answer' }, res.speakText && canSpeak(res.speakText, res.voice) ? speakBtn(res.speakText, { size: 'sm', voice: res.voice }) : null, h('span', null, res.answer)),
        res.speakText ? hangulEl(res.speakText, 'hangul tiny') : null,
        res.sub && res.sub !== res.answer ? h('div', { class: 'small text-2 mt-4' }, res.sub) : null,
      ));
    }
    if (res.mine && !res.ok && cur.type !== 'tiles') kids.push(h('div', { class: 'fb-why' }, '내 답: ', diffView(res.mine, res.answer)));
    if (res.mine && cur.type === 'tiles') kids.push(h('div', { class: 'fb-why' }, '내 답: ', res.mine));
    if (res.note) kids.push(h('div', { class: 'fb-why' }, '💡 ', res.note));
    if (res.why) kids.push(h('div', { class: 'fb-why', html: `💡 ${res.why}` }));
    fb.replaceChildren(...kids);
    setMain('계속', res.ok ? 'btn-ok' : 'btn-bad', true, cont);
    setTimeout(() => mainBtn.focus({ preventScroll: true }), 30);
  }

  function cont() {
    const res = lastResult || {};
    if (!res.ok && requeue && !res.noRequeue && (cur.retry || 0) < 2) queue.push({ ...cur, retry: (cur.retry || 0) + 1 });
    else done++;
    next();
  }

  function finish() {
    alive = false;
    cleanup();
    let total = 0, correct = 0;
    for (const [id, ok] of first) {
      if (INFO_TYPES.has(steps[id].type)) continue;
      total++;
      if (ok) correct++;
    }
    onFinish?.({ total, correct, acc: total ? correct / total : 1, wrongWords: [...wrongWords], ms: Date.now() - started }, root);
  }

  function onKey(e) {
    if (!alive || e.defaultPrevented) return;
    const inField = e.target.matches?.('input, textarea');
    if (e.key === 'Enter') {
      if (!foot.hidden && !btnRow.hidden && !mainBtn.disabled && !(inField && phase === 'answer')) { e.preventDefault(); mainBtn.click(); }
      return;
    }
    if (!inField && phase === 'answer') curR?.onKey?.(e.key);
  }
  document.addEventListener('keydown', onKey);

  closeBtn.addEventListener('click', async () => {
    if (!confirmExit || done === 0 || (await confirmSheet('지금 그만두면 이번 학습 기록은 저장되지 않아요.', { title: '그만할까요?', ok: '그만하기', cancel: '계속 학습', danger: true }))) {
      alive = false;
      cleanup();
      onExit?.();
    }
  });

  function cleanup() {
    document.removeEventListener('keydown', onKey);
    stopSpeaking();
    stopListening();
  }

  next();
  return () => { alive = false; cleanup(); };
}

/** 세션 완료 화면 */
export function renderDone(root, { emoji = '🎉', title, sub, stats = [], starCount = null, buttons = [], extra = null }) {
  const el = h('div', { class: 'stage' },
    h('div', { class: 'stage-body', style: { paddingBottom: '40px' } },
      h('div', { class: 'done-screen' },
        h('div', { class: 'done-emoji', 'aria-hidden': 'true' }, emoji),
        h('div', { class: 'done-title' }, title),
        sub ? h('div', { class: 'done-sub' }, sub) : null,
        starCount != null ? h('div', { class: 'big-stars', 'aria-label': `별 ${starCount}개` }, [0, 1, 2].map((i) => h('span', { class: i < starCount ? 'on' : '' }, icon('star', 44)))) : null,
        stats.length ? h('div', { class: 'done-stats' }, stats.map((s) => h('div', { class: `done-stat ${s.cls || ''}` }, h('div', { class: 'v' }, s.v), h('div', { class: 'k' }, s.k)))) : null,
        extra,
        h('div', { class: 'col', style: { width: '100%', maxWidth: '420px', marginTop: '12px' } },
          buttons.map((b) => h('button', { class: `btn btn-lg btn-block ${b.cls || 'btn-outline'}`, type: 'button', onclick: b.onClick }, b.label)),
        ),
      ),
    ),
  );
  root.replaceChildren(el);
  setTimeout(() => el.querySelector('button')?.focus({ preventScroll: true }), 50);
}

export const fmtDuration = (ms) => {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}초` : `${Math.floor(s / 60)}분 ${s % 60 ? `${s % 60}초` : ''}`.trim();
};
