// 문제 화면 렌더러. 각 렌더러는 { el, info?, check?(), onKey?(k), onShow?() } 를 돌려준다.
// api: submit(result) · setReady(bool) · setMain(cfg) · done(result)
import { h, icon, speakBtn, hangulEl, shuffle, POS_LABEL, tapToSpeak } from '../core/ui.js';
import { openNoteSheet } from './grammar.js';
import { NOTE } from '../data/notes.js';
import { speak, stopSpeaking } from '../core/tts.js';
import { listenOnce, stopListening, bestMatch, wordMatches, STT_ERRORS } from '../core/stt.js';
import { state } from '../core/store.js';
import { checkAnswer, diffChars, accentHint, normalize, trLower, TR_EXTRA } from '../core/tr.js';
import { WORDS } from '../data/vocab.js';
import { distractorWords } from '../core/lessonBuilder.js';

const autoplay = () => state.settings.autoplay;

// 문장 첫 단어 타일은 소문자로 (고유명사 제외) — 대문자가 정답 힌트가 되지 않도록
const PROPER = new Set([
  ...WORDS.filter((w) => w.proper || /^[A-ZÇĞİÖŞÜ]/.test(w.tr)).map((w) => normalize(w.tr).split(' ')[0]),
  'ali', 'mina', 'ayşe', 'ahmet', 'jisu', 'mehmet', 'zeynep', 'elif', 'can', 'sultanahmet', 'kadıköy', 'taksim',
  'kapadokya', 'antalya', 'izmir', 'busan', 'kapalıçarşı', 'ayasofya', 'boğaziçi', 'adana',
]);
export function displayToken(t) {
  const base = normalize(t.split(/[’']/)[0]);
  if (PROPER.has(base) || /['’]/.test(t)) return t;
  return trLower(t);
}


function wordHeader(w, { big = true } = {}) {
  return h('div', { class: 'col', style: { gap: '4px', minWidth: 0 } },
    h('div', { class: big ? 'word-xl' : 'big' }, w.tr),
    hangulEl(w.tr),
  );
}

function exampleBox(ex) {
  if (!ex) return null;
  return h('div', { class: 'example' },
    speakBtn(ex[0], { size: 'sm' }),
    h('div', { class: 'grow' },
      h('div', { class: 'ex-tr' }, ex[0]),
      hangulEl(ex[0], 'hangul tiny'),
      h('div', { class: 'ex-ko' }, ex[1]),
    ),
  );
}

// ---------- 정보 카드 ----------
export function renderTip(step) {
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('bulb', 16), '한국인을 위한 팁'),
    h('h2', null, step.tip.title),
    tapToSpeak(h('div', { class: 'card prose', html: step.tip.html })),
    h('p', { class: 'small muted' }, '굵은 튀르키예어를 누르면 발음을 들을 수 있어요.'),
    (step.notes || []).length ? h('div', { class: 'chips' }, step.notes.map((id) => h('button', { class: 'chip', type: 'button', onclick: () => openNoteSheet(id) }, `📖 ${NOTE.get(id)?.title || '문법 노트'}`))) : null,
  );
  return { el, info: true };
}

export function renderIntro(step) {
  const w = step.w;
  const seen = step.seen;
  const el = h('div', { class: 'ex' },
    h('div', { class: `ex-label ${seen ? '' : 'new'}` }, icon(seen ? 'refresh' : 'plus', 16), seen ? '다시 보기' : '새 단어'),
    h('div', { class: 'intro-card' },
      h('div', { class: 'intro-top' },
        wordHeader(w),
        h('div', { class: 'intro-audio' }, speakBtn(w.tr), speakBtn(w.tr, { slow: true })),
      ),
      h('div', null,
        h('div', { class: 'meaning' }, w.ko),
        h('div', { class: 'pos mt-4' }, POS_LABEL[w.pos] || ''),
      ),
      exampleBox(w.ex),
      w.note ? h('div', { class: 'note ko' }, h('div', { class: 'note-title' }, icon('bulb', 14), '포인트'), w.note) : null,
    ),
  );
  return { el, info: true, onShow: () => { if (autoplay()) speak(w.tr); } };
}

// ---------- 객관식 ----------
function optionsUI(items, onPick) {
  const wrap = h('div', { class: 'options' });
  const btns = items.map((it, i) => {
    const b = h('button', { class: 'option', type: 'button' },
      h('span', { class: 'opt-key' }, String(i + 1)),
      h('span', { class: 'opt-text' }, it.label, it.sub ? h('span', { class: 'opt-sub' }, it.sub) : null),
    );
    b.addEventListener('click', () => onPick(i, b));
    wrap.append(b);
    return b;
  });
  return { wrap, btns };
}

export function mcCore({ el, items, correctIdx, result, onCorrectSpeak }, api) {
  let answered = false;
  const { wrap, btns } = optionsUI(items, (i) => pickIdx(i));
  function pickIdx(i) {
    if (answered) return;
    answered = true;
    const ok = i === correctIdx;
    btns.forEach((b, j) => {
      b.disabled = true;
      if (j === correctIdx) b.classList.add('correct');
      else if (j === i) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    if (onCorrectSpeak) speak(onCorrectSpeak);
    api.submit({ ok, ...result });
  }
  el.append(wrap);
  return { onKey: (k) => { const n = Number(k); if (n >= 1 && n <= items.length) pickIdx(n - 1); } };
}

export function renderMC(step, api) {
  const w = step.w;
  const distract = distractorWords(w, step.pool || [], 3);
  const all = shuffle([w, ...distract]);
  const correctIdx = all.indexOf(w);
  const el = h('div', { class: 'ex' });
  let onShow;
  if (step.mode === 'ko2tr') {
    el.append(
      h('div', { class: 'ex-label' }, '튀르키예어로 어떻게 말할까요?'),
      h('div', { class: 'ex-prompt' }, h('div', { class: 'ko-big' }, w.ko)),
    );
  } else if (step.mode === 'listen2ko') {
    el.append(
      h('div', { class: 'ex-label' }, icon('headphones', 16), '듣고 뜻을 고르세요'),
      h('div', { class: 'play-row' }, speakBtn(w.tr, { size: 'xl' }), speakBtn(w.tr, { size: 'xl', slow: true })),
    );
    onShow = () => speak(w.tr);
  } else {
    el.append(
      h('div', { class: 'ex-label' }, '이 단어의 뜻은?'),
      h('div', { class: 'ex-prompt' }, h('div', { class: 'col', style: { gap: '2px' } }, h('div', { class: 'big' }, w.tr), hangulEl(w.tr)), speakBtn(w.tr)),
    );
    onShow = () => { if (autoplay()) speak(w.tr); };
  }
  const items = all.map((x) => (step.mode === 'ko2tr' ? { label: x.tr } : { label: x.ko }));
  const core = mcCore({
    el, items, correctIdx,
    result: { answer: w.tr, sub: w.ko, speakText: w.tr },
    onCorrectSpeak: step.mode === 'ko2tr' ? w.tr : null,
  }, api);
  return { el, onShow, ...core };
}

export function renderChoice(step, api) {
  const it = step.it;
  const order = shuffle(it.opts.map((o, i) => i));
  const correctIdx = order.indexOf(it.a);
  const qEl = h('div', { class: 'ex-q' });
  const parts = String(it.q).split('___');
  parts.forEach((p, i) => {
    qEl.append(p);
    if (i < parts.length - 1) qEl.append(h('span', { class: 'blank', style: { display: 'inline-block', minWidth: '56px', borderBottom: '3px solid var(--brand)', margin: '0 4px' } }, ' '));
  });
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('bulb', 16), step.label || '문법 확인'),
    qEl,
    it.ko ? h('div', { class: 'text-2' }, it.ko) : null,
  );
  const answerText = parts.length > 1 ? parts.join(it.opts[it.a]).replace(/\s+([.?!,])/g, '$1') : it.opts[it.a];
  const core = mcCore({
    el,
    items: order.map((i) => ({ label: it.opts[i] })),
    correctIdx,
    result: { answer: answerText, sub: it.ko, why: it.why, speakText: /[a-zçğıöşü]/i.test(answerText) && !/[가-힣]/.test(answerText) ? answerText : null },
  }, api);
  return { el, ...core };
}

export function renderListenSent(step, api) {
  const correctIdx = step.options.indexOf(step.ko);
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('headphones', 16), '듣고 알맞은 뜻을 고르세요'),
    h('div', { class: 'play-row' }, speakBtn(step.tr, { size: 'xl' }), speakBtn(step.tr, { size: 'xl', slow: true })),
  );
  const core = mcCore({ el, items: step.options.map((o) => ({ label: o })), correctIdx, result: { answer: step.tr, sub: step.ko, speakText: step.tr } }, api);
  return { el, onShow: () => speak(step.tr), ...core };
}

// ---------- 짝 맞추기 ----------
export function renderMatch(step, api) {
  const words = step.words;
  const left = shuffle(words), right = shuffle(words);
  let selL = null, selR = null, matched = 0, mistakes = 0;
  const wrongWords = new Set();
  const lBtns = new Map(), rBtns = new Map();
  const tryMatch = () => {
    if (!selL || !selR) return;
    const bl = lBtns.get(selL), br = rBtns.get(selR);
    if (selL === selR) {
      [bl, br].forEach((b) => { b.classList.remove('sel'); b.classList.add('ok-flash'); });
      setTimeout(() => [bl, br].forEach((b) => b.classList.add('done')), 260);
      matched++;
      if (matched === words.length) {
        setTimeout(() => api.submit({ ok: true, perfect: mistakes === 0, mistakes, wrongWords: [...wrongWords], noRequeue: true, title: mistakes ? `완료! (실수 ${mistakes}번)` : null }), 350);
      }
    } else {
      mistakes++;
      wrongWords.add(selL); wrongWords.add(selR);
      [bl, br].forEach((b) => { b.classList.remove('sel'); b.classList.add('bad-flash'); setTimeout(() => b.classList.remove('bad-flash'), 400); });
    }
    selL = selR = null;
  };
  const mk = (w, side) => {
    const b = h('button', { class: 'match-btn', type: 'button' }, side === 'L' ? w.tr : w.ko);
    b.addEventListener('click', () => {
      if (side === 'L') {
        speak(w.tr);
        if (selL) lBtns.get(selL).classList.remove('sel');
        selL = w.id;
      } else {
        if (selR) rBtns.get(selR).classList.remove('sel');
        selR = w.id;
      }
      b.classList.add('sel');
      tryMatch();
    });
    (side === 'L' ? lBtns : rBtns).set(w.id, b);
    return b;
  };
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, '짝을 맞춰 보세요'),
    h('div', { class: 'match' },
      h('div', { class: 'match-col' }, left.map((w) => mk(w, 'L'))),
      h('div', { class: 'match-col' }, right.map((w) => mk(w, 'R'))),
    ),
  );
  return { el };
}

// ---------- 단어 타일 ----------
export function renderTiles(step, api) {
  const tokens = step.tokens.map(displayToken);
  const pool = shuffle([...tokens, ...(step.extra || []).map(displayToken)]);
  const answer = [];
  const zone = h('div', { class: 'answer-zone', 'aria-label': '내 답' });
  const bank = h('div', { class: 'bank' });
  let locked = false;
  const bankBtns = pool.map((t, i) => {
    const b = h('button', { class: 'tile', type: 'button' }, t);
    b.addEventListener('click', () => {
      if (locked || b.classList.contains('used')) return;
      b.classList.add('used');
      const a = h('button', { class: 'tile', type: 'button' }, t);
      a.addEventListener('click', () => {
        if (locked) return;
        a.remove();
        answer.splice(answer.findIndex((x) => x.btn === a), 1);
        b.classList.remove('used');
        api.setReady(answer.length > 0);
      });
      answer.push({ t, btn: a, i });
      zone.append(a);
      speak(t, { rate: (state.settings.rate || 0.9) * 1.05 });
      api.setReady(true);
    });
    bank.append(b);
    return b;
  });
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, '튀르키예어 문장을 만들어 보세요'),
    h('div', { class: 'tiles-prompt' }, h('div', { class: 'avatar', 'aria-hidden': 'true' }, '🧕'), h('div', { class: 'bubble' }, step.ko)),
    zone,
    bank,
  );
  return {
    el,
    check() {
      locked = true;
      const got = answer.map((x) => x.t).join(' ');
      const ok = [step.tr, ...(step.alts || [])].some((s) => normalize(s) === normalize(got));
      bankBtns.forEach((b) => { b.disabled = true; });
      return { ok, answer: step.tr, sub: step.ko, speakText: step.tr, mine: ok ? null : got };
    },
  };
}

// ---------- 타이핑 ----------
export function letterBar(input) {
  const bar = h('div', { class: 'letter-bar', 'aria-label': '튀르키예어 특수문자' });
  for (const ch of TR_EXTRA) {
    const b = h('button', { class: 'letter-key', type: 'button', 'aria-label': `${ch} 입력` }, ch);
    b.addEventListener('pointerdown', (e) => e.preventDefault());
    b.addEventListener('click', () => {
      const s = input.selectionStart ?? input.value.length, e2 = input.selectionEnd ?? s;
      input.value = input.value.slice(0, s) + ch + input.value.slice(e2);
      input.setSelectionRange(s + ch.length, s + ch.length);
      input.focus();
      input.dispatchEvent(new Event('input'));
    });
    bar.append(b);
  }
  return bar;
}

export function diffView(mine, expected) {
  const d = diffChars(mine, expected);
  return h('span', { class: 'diff' }, d.map((x) => h('span', { class: x.miss ? 'd-miss' : x.ok ? '' : 'd-bad' }, x.ch)));
}

export function typeCore({ el, answers, strict = false, multiline = false, placeholder = '튀르키예어로 입력', result }, api) {
  const input = h(multiline ? 'textarea' : 'input', {
    class: 'type-input', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
    lang: 'tr', placeholder, enterkeyhint: 'done', 'aria-label': placeholder,
  });
  input.addEventListener('input', () => api.setReady(input.value.trim().length > 0));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); api.trigger(); }
  });
  el.append(h('div', { class: 'type-wrap' }, input, letterBar(input)));
  return {
    onShow: () => setTimeout(() => input.focus({ preventScroll: true }), 120),
    check() {
      const r = checkAnswer(input.value, answers, { strict });
      input.disabled = true;
      input.classList.add(r.ok ? 'ok' : 'bad');
      const res = { ok: r.ok, answer: r.expected, ...result };
      if (r.level === 'accent' && r.ok) res.note = `특수문자를 확인하세요: ${accentHint(input.value, r.expected) || '철자'}`;
      if (r.level === 'accent' && !r.ok) res.note = `거의 맞았어요! 이 문제는 특수문자까지 정확해야 해요 (ı/i, ş/s …): ${accentHint(input.value, r.expected) || '철자 확인'}`;
      if (r.level === 'typo') res.note = '오타가 조금 있어요 — 철자를 확인하세요.';
      if (!r.ok || r.level !== 'exact') res.mine = input.value;
      return res;
    },
  };
}

export function renderTypeWord(step, api) {
  const w = step.w;
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('words', 16), '튀르키예어로 써 보세요'),
    h('div', { class: 'ex-prompt' }, h('div', null, h('div', { class: 'ko-big' }, w.ko), h('div', { class: 'pos mt-4' }, POS_LABEL[w.pos] || ''))),
  );
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, icon('hint', 16), '힌트');
  let hintLevel = 0;
  const hintText = h('span', { class: 'bold', style: { letterSpacing: '.12em' } });
  hintBtn.addEventListener('click', () => {
    hintLevel = Math.min(w.tr.length, hintLevel + Math.max(1, Math.ceil(w.tr.length / 4)));
    hintText.textContent = [...w.tr].map((c, i) => (i < hintLevel || c === ' ' ? c : '_')).join('');
    step.hinted = true;
  });
  const core = typeCore({ el, answers: [w.tr, ...(w.alt || [])], result: { sub: w.ko, speakText: w.tr } }, api);
  el.append(h('div', { class: 'row' }, hintBtn, hintText));
  return { el, ...core };
}

export function renderTypeSent(step, api) {
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('words', 16), step.dictation ? '듣고 받아쓰세요' : '튀르키예어로 써 보세요'),
    step.dictation
      ? h('div', { class: 'play-row' }, speakBtn(step.tr, { size: 'xl' }), speakBtn(step.tr, { size: 'xl', slow: true }))
      : h('div', { class: 'tiles-prompt' }, h('div', { class: 'avatar', 'aria-hidden': 'true' }, '🧑'), h('div', { class: 'bubble' }, step.ko)),
  );
  const core = typeCore({ el, answers: [step.tr, ...(step.alts || [])], multiline: step.tr.length > 28, result: { sub: step.ko, speakText: step.tr } }, api);
  const onShow0 = core.onShow;
  return { el, ...core, onShow: () => { onShow0(); if (step.dictation) speak(step.tr); } };
}

// ---------- 말하기 (음성 인식) ----------
export function renderSpeak(step, api) {
  const target = step.tr;
  let tries = 0;
  const status = h('div', { class: 'small text-2 center' }, '마이크를 누르고 문장을 소리 내어 읽어 보세요');
  const heard = h('div', { class: 'center bold', style: { fontSize: '19px', minHeight: '30px' } });
  const mic = h('button', { class: 'mic-btn', type: 'button', 'aria-label': '말하기 시작' }, icon('mic', 38));
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('mic', 16), '소리 내어 말해 보세요'),
    h('div', { class: 'intro-card' },
      h('div', { class: 'row', style: { alignItems: 'flex-start' } },
        h('div', { class: 'grow' },
          h('div', { style: { fontSize: '24px', fontWeight: 800, lineHeight: 1.35 } }, target),
          hangulEl(target),
          h('div', { class: 'text-2 mt-4' }, step.ko),
        ),
        speakBtn(target), speakBtn(target, { slow: true }),
      ),
    ),
    h('div', { class: 'play-row' }, mic),
    status,
    heard,
  );
  mic.addEventListener('click', async () => {
    if (mic.classList.contains('listening')) { stopListening(); return; }
    stopSpeaking();
    mic.classList.add('listening');
    status.textContent = '듣고 있어요… 말해 보세요';
    const r = await listenOnce();
    mic.classList.remove('listening');
    if (!r.ok) { status.textContent = STT_ERRORS[r.error] || '잘 듣지 못했어요. 다시 시도해 주세요.'; return; }
    tries++;
    const best = bestMatch(r.alternatives, target);
    const pct = Math.round(best.score * 100);
    heard.replaceChildren(...wordMatches(target, best.text).map(({ w, ok }) => h('span', { style: { color: ok ? 'var(--ok)' : 'var(--bad)', marginRight: '6px' } }, w)));
    status.textContent = `들린 문장: "${best.text}" · 일치도 ${pct}%`;
    if (best.score >= 0.75) {
      api.submit({ ok: true, answer: target, sub: step.ko, title: `발음 ${pct}% — 잘 알아들었어요!`, noRequeue: true });
    } else if (tries >= 3) {
      api.submit({ ok: false, answer: target, sub: step.ko, speakText: target, title: '조금 더 연습해 봐요', why: '🐢 천천히 듣기로 한 단어씩 따라 해 보세요.', noRequeue: true });
    } else {
      status.textContent += ' — 또박또박 다시 말해 볼까요?';
    }
  });
  return {
    el,
    custom: true,
    onShow() {
      api.setMain('건너뛰기', () => api.submit({ ok: false, skipped: true, answer: target, sub: step.ko, title: '다음에 다시 해 봐요', noRequeue: true }), 'btn-outline');
    },
  };
}

export const RENDERERS = {  tip: renderTip,
  intro: renderIntro,
  mc: renderMC,
  choice: renderChoice,
  listenSent: renderListenSent,
  match: renderMatch,
  tiles: renderTiles,
  typeWord: renderTypeWord,
  typeSent: renderTypeSent,
  speak: renderSpeak,
};
