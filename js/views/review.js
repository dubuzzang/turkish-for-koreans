// 간격 반복 복습 (FSRS) + 새 단어 늘리기
import { h, icon, speakBtn, hangulEl, POS_LABEL, shuffle } from '../core/ui.js';
import { state, addXP } from '../core/store.js';
import { dueCards, reviewCard, previewCard, parseCardId, deckStats, learnWords, isLearned, newToday } from '../core/deck.js';
import { formatInterval } from '../core/srs.js';
import { speak } from '../core/tts.js';
import { checkAnswer } from '../core/tr.js';
import { sfxComplete } from '../core/sfx.js';
import { WORD, WORDS, CATS, wordsByCat } from '../data/vocab.js';
import { LESSONS } from '../data/curriculum.js';
import { runSession, renderDone, fmtDuration } from './session.js';
import { letterBar } from './exercises.js';
import { canListen } from './lesson.js';

const RATE = [
  { g: 1, label: '다시', cls: 'r1' },
  { g: 2, label: '어려움', cls: 'r2' },
  { g: 3, label: '알맞음', cls: 'r3' },
  { g: 4, label: '쉬움', cls: 'r4' },
];

function renderFlash(step, api) {
  const cid = step.cid;
  const { wordId, dir } = parseCardId(cid);
  const w = WORD.get(wordId);
  const el = h('div', { class: 'ex' });
  if (!w || !state.cards[cid]) {
    setTimeout(() => api.advance({ skip: true }), 0);
    return { el, custom: true };
  }
  const isProd = dir === 'p';
  let revealed = false;
  let input = null;
  const flash = h('div', { class: 'flash' },
    h('span', { class: `badge side-tag ${isProd ? 'violet' : 'brand'}` }, isProd ? '뜻 → 튀르키예어' : '튀르키예어 → 뜻'),
  );
  if (isProd) {
    flash.append(h('div', { class: 'meaning', style: { fontSize: '26px' } }, w.ko), h('div', { class: 'pos' }, POS_LABEL[w.pos] || ''));
    input = h('input', { class: 'type-input', placeholder: '떠올려서 입력해 보세요 (선택)', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', lang: 'tr', style: { textAlign: 'center' } });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); reveal(); } });
    flash.append(h('div', { class: 'type-wrap', style: { width: '100%' } }, input, letterBar(input)));
  } else {
    flash.append(h('div', { class: 'word-xl' }, w.tr), hangulEl(w.tr), h('div', { class: 'row' }, speakBtn(w.tr), speakBtn(w.tr, { slow: true })));
  }
  el.append(flash);

  function reveal() {
    if (revealed) return;
    revealed = true;
    let verdict = null;
    if (input && input.value.trim()) {
      const r = checkAnswer(input.value, [w.tr, ...w.alt]);
      verdict = r;
      input.disabled = true;
      input.classList.add(r.ok ? 'ok' : 'bad');
    }
    const back = h('div', { class: 'reveal' },
      h('div', { class: 'divider', style: { width: '100%' } }),
      isProd
        ? h('div', { class: 'col', style: { alignItems: 'center', gap: '4px' } }, h('div', { class: 'word-xl' }, w.tr), hangulEl(w.tr), h('div', { class: 'row' }, speakBtn(w.tr), speakBtn(w.tr, { slow: true })))
        : h('div', { class: 'col', style: { alignItems: 'center', gap: '2px' } }, h('div', { class: 'meaning' }, w.ko), h('div', { class: 'pos' }, POS_LABEL[w.pos] || '')),
      verdict ? h('div', { class: `badge ${verdict.ok ? 'ok' : 'bad'}` }, verdict.ok ? (verdict.level === 'exact' ? '정확해요!' : '거의 맞았어요') : '아쉬워요') : null,
      w.ex ? h('div', { class: 'example' }, speakBtn(w.ex[0], { size: 'sm' }), h('div', { class: 'grow' }, h('div', { class: 'ex-tr' }, w.ex[0]), h('div', { class: 'ex-ko' }, w.ex[1]))) : null,
      w.note ? h('div', { class: 'note ko', style: { width: '100%', textAlign: 'left' } }, w.note) : null,
    );
    flash.append(back);
    speak(w.tr);
    const pv = previewCard(cid);
    const suggest = verdict ? (verdict.ok ? 3 : 1) : null;
    const row = h('div', { class: 'rate-row' }, RATE.map((r, i) => {
      const b = h('button', { class: `rate-btn ${r.cls}`, type: 'button', style: suggest === r.g ? { outline: '3px solid currentColor', outlineOffset: '2px' } : null },
        r.label, h('small', null, formatInterval(pv[i])));
      b.addEventListener('click', () => rate(r.g));
      return b;
    }));
    api.hideButtons();
    api.setExtra(h('div', { class: 'small muted center', style: { marginBottom: '8px' } }, '얼마나 잘 기억났나요?'), row);
  }

  function rate(g) {
    reviewCard(cid, g);
    api.advance({ ok: g > 1, requeue: g === 1 });
  }

  return {
    el,
    custom: true,
    onShow() {
      api.setMain('정답 보기', reveal);
      if (!isProd && state.settings.autoplay) speak(w.tr);
      if (input) setTimeout(() => input.focus({ preventScroll: true }), 120);
    },
    onKey(k) {
      if (k === ' ' && !revealed) reveal();
      else if (revealed && ['1', '2', '3', '4'].includes(k)) rate(Number(k));
    },
  };
}

function landing(root, go) {
  const s = deckStats();
  const due = s.due;
  root.append(
    h('div', { class: 'page-head' },
      h('h1', null, '복습'),
      h('p', null, '잊어버리기 직전에 다시 보면 기억이 가장 오래가요. 매일 조금씩!'),
    ),
    h('div', { class: 'stat-tiles' },
      h('div', { class: 'stat-tile accent' }, h('div', { class: 'v' }, String(due)), h('div', { class: 'k' }, '지금 복습할 카드')),
      h('div', { class: 'stat-tile brand' }, h('div', { class: 'v' }, String(s.words)), h('div', { class: 'k' }, '학습한 단어')),
      h('div', { class: 'stat-tile gold' }, h('div', { class: 'v' }, String(s.mature)), h('div', { class: 'k' }, '장기 기억(21일+)')),
    ),
  );
  if (due) {
    root.append(h('button', { class: 'btn btn-primary btn-lg btn-block mt-16', onclick: () => go('#/review/go') }, icon('cards', 22), `복습 시작 (${due}개)`));
  } else {
    const upcoming = Object.values(state.cards).filter((c) => !c.suspended).sort((a, b) => a.due - b.due)[0];
    root.append(h('div', { class: 'card center mt-16' },
      h('div', { style: { fontSize: '40px' } }, s.words ? '🎉' : '🌱'),
      h('div', { class: 'bold mt-8' }, s.words ? '지금은 복습할 카드가 없어요!' : '아직 복습 카드가 없어요'),
      h('div', { class: 'small text-2 mt-4' }, s.words
        ? `다음 복습: ${upcoming ? new Date(upcoming.due).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-'}`
        : '레슨을 마치거나 아래에서 새 단어를 배우면 복습 카드가 생겨요.'),
    ));
  }

  // 새 단어 늘리기
  const limit = state.settings.newPerDay || 10;
  const learnedToday = newToday();
  let selCat = 'auto';
  const catChips = h('div', { class: 'chips-scroll' });
  const startBtn = h('button', { class: 'btn btn-soft btn-lg btn-block mt-12' });
  const renderChips = () => {
    catChips.replaceChildren(
      h('button', { class: `chip ${selCat === 'auto' ? 'active' : ''}`, onclick: () => { selCat = 'auto'; renderChips(); } }, '✨ 추천 순서'),
      ...CATS.map((c) => {
        const left = wordsByCat(c.id).filter((w) => !isLearned(w.id)).length;
        return h('button', { class: `chip ${selCat === c.id ? 'active' : ''}`, disabled: left === 0, onclick: () => { selCat = c.id; renderChips(); } }, `${c.emoji} ${c.ko} ${left}`);
      }),
    );
    const n = Math.min(5, poolFor(selCat).length);
    startBtn.disabled = n === 0;
    startBtn.replaceChildren(icon('plus', 20), n ? `새 단어 ${n}개 배우기` : '배울 단어가 없어요');
  };
  startBtn.addEventListener('click', () => go(`#/review/new/${selCat}`));
  root.append(
    h('section', { class: 'section' },
      h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '새 단어 늘리기'), h('div', { class: 'small muted' }, `오늘 ${learnedToday}/${limit}`)),
      h('div', { class: 'card' },
        h('p', { class: 'small text-2' }, '레슨 밖의 단어도 주제별로 5개씩 배워 복습 덱에 넣을 수 있어요. 하루 권장량을 넘기면 복습 부담이 커지니 주의하세요.'),
        h('div', { class: 'mt-12' }, catChips),
        startBtn,
      ),
    ),
    h('section', { class: 'section' },
      h('div', { class: 'card flat' },
        h('div', { class: 'bold' }, '💡 평가 버튼 사용법'),
        h('ul', { class: 'small text-2', style: { paddingLeft: '18px', margin: '8px 0 0' } },
          h('li', null, h('b', null, '다시'), ' — 기억나지 않았어요. 잠시 후 다시 나와요.'),
          h('li', null, h('b', null, '어려움'), ' — 겨우 떠올렸어요.'),
          h('li', null, h('b', null, '알맞음'), ' — 조금 생각하고 떠올렸어요. (가장 많이 누르게 돼요)'),
          h('li', null, h('b', null, '쉬움'), ' — 바로 떠올랐어요.'),
        ),
        h('p', { class: 'small muted mt-8' }, '최신 간격 반복 알고리즘(FSRS)이 기억률 90%를 유지하도록 다음 복습일을 계산해요. 단어를 충분히 익히면 "뜻 → 튀르키예어" 카드가 추가로 열려요.'),
      ),
    ),
  );
  renderChips();
}

function poolFor(cat) {
  if (cat === 'auto') {
    // 레슨 단어(순서대로) → 나머지 단어
    const inLessons = LESSONS.flatMap((l) => l.words);
    const order = [...new Set([...inLessons, ...WORDS.map((w) => w.id)])];
    return order.map((id) => WORD.get(id)).filter((w) => w && !isLearned(w.id));
  }
  return wordsByCat(cat).filter((w) => !isLearned(w.id));
}

function learnNew(root, cat, go) {
  const words = poolFor(cat).slice(0, 5);
  if (!words.length) { go('#/review'); return null; }
  const listening = canListen();
  const steps = [];
  words.forEach((w) => steps.push({ type: 'intro', w }));
  shuffle(words).forEach((w, i) => steps.push({ type: 'mc', mode: listening && i % 2 ? 'listen2ko' : 'tr2ko', w, pool: words, key: `w:${w.id}` }));
  steps.push({ type: 'match', words });
  shuffle(words).slice(0, 3).forEach((w) => steps.push({ type: 'mc', mode: 'ko2tr', w, pool: words, key: `w:${w.id}` }));
  shuffle(words).slice(0, 2).forEach((w) => steps.push({ type: 'typeWord', w, key: `w:${w.id}` }));
  return runSession(root, {
    steps,
    onExit: () => go('#/review'),
    onFinish: (sum) => {
      const wrong = new Set(sum.wrongWords);
      learnWords(words.map((w) => w.id), Object.fromEntries(words.map((w) => [w.id, wrong.has(w.id) ? 1 : 2])));
      const xp = 5 + words.length * 2;
      addXP(xp);
      sfxComplete();
      renderDone(root, {
        emoji: '🌱',
        title: '새 단어 학습 완료!',
        sub: `${words.map((w) => w.tr).join(', ')} — 내일부터 복습 카드로 나와요.`,
        stats: [
          { v: `${Math.round(sum.acc * 100)}%`, k: '정확도', cls: 'ok' },
          { v: `+${xp}`, k: 'XP', cls: 'gold' },
          { v: fmtDuration(sum.ms), k: '학습 시간', cls: 'brand' },
        ],
        buttons: [
          { label: '5개 더 배우기', cls: 'btn-primary', onClick: () => go(`#/review/new/${cat}`) },
          { label: '복습으로', onClick: () => go('#/review') },
        ],
      });
    },
  });
}

function reviewSession(root, go) {
  const cards = dueCards().slice(0, 120);
  if (!cards.length) { go('#/review'); return null; }
  const steps = cards.map((c) => ({ type: 'flash', cid: c.id }));
  const start = Date.now();
  let reviewed = 0;
  return runSession(root, {
    steps,
    renderers: { flash: (step, api) => { reviewed++; return renderFlash(step, api); } },
    requeue: false,
    showCount: true,
    onExit: () => go('#/review'),
    onFinish: (sum) => {
      const xp = Math.max(3, Math.round(cards.length * 1.2));
      addXP(xp);
      sfxComplete();
      renderDone(root, {
        emoji: '🧠',
        title: '오늘 복습 끝!',
        sub: '기억은 꺼낼 때마다 단단해져요. 내일 또 만나요!',
        stats: [
          { v: String(cards.length), k: '복습한 카드', cls: 'brand' },
          { v: `${Math.round(sum.acc * 100)}%`, k: '기억률', cls: 'ok' },
          { v: `+${xp}`, k: 'XP', cls: 'gold' },
        ],
        extra: h('div', { class: 'small muted' }, `소요 시간 ${fmtDuration(Date.now() - start)} · 평가 ${reviewed}회`),
        buttons: [
          { label: '홈으로', cls: 'btn-primary', onClick: () => go('#/home') },
          { label: '새 단어 배우기', onClick: () => go('#/review') },
        ],
      });
    },
  });
}

export default {
  tab: 'review',
  title: '복습',
  immersive: (p) => p[0] === 'go' || p[0] === 'new',
  render(root, params, { go }) {
    if (params[0] === 'go') return reviewSession(root, go);
    if (params[0] === 'new') return learnNew(root, params[1] || 'auto', go);
    landing(root, go);
    return null;
  },
};
