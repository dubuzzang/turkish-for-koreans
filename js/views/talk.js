// 상황별 회화: 목록 · 대화 보기(전체 듣기, 번역 가리기) · 역할 연습
import { h, icon, speakBtn, hangulEl } from '../core/ui.js';
import { state, commit, addXP } from '../core/store.js';
import { speak, stopSpeaking } from '../core/tts.js';
import { sttSupported } from '../core/stt.js';
import { tokenize } from '../core/tr.js';
import { tileDistractors } from '../core/lessonBuilder.js';
import { sfxComplete } from '../core/sfx.js';
import { DIALOGUES, DIALOGUE } from '../data/dialogues.js';
import { runSession, renderDone, fmtDuration } from './session.js';

const talks = () => (state.talks ||= {});

function bubble(d, [role, tr, ko], { hideKo = false, me = null } = {}) {
  const r = d.roles[role];
  const right = me ? role === me : role === 'B';
  const koEl = h('div', { class: `bub-ko ${hideKo ? 'blur' : ''}` }, ko);
  koEl.addEventListener('click', () => koEl.classList.remove('blur'));
  const textEl = h('div', { class: 'bub-tr', role: 'button', tabindex: '0', title: '눌러서 듣기' }, tr);
  textEl.addEventListener('click', () => speak(tr));
  return h('div', { class: `bub-row ${right ? 'right' : ''}` },
    h('div', { class: 'bub-av', 'aria-hidden': 'true' }, r.emoji),
    h('div', { class: 'bub' },
      h('div', { class: 'bub-name' }, r.name),
      textEl,
      hangulEl(tr, 'hangul tiny'),
      koEl,
    ),
  );
}

function list(root) {
  root.append(
    h('div', { class: 'page-head' },
      h('a', { class: 'small', href: '#/learn' }, '← 학습 경로'),
      h('h1', { class: 'mt-4' }, '상황별 회화'),
      h('p', null, '여행과 일상에서 그대로 쓰는 대화예요. 듣고, 따라 하고, 역할을 맡아 연습해 보세요.'),
    ),
    h('a', { class: 'card tap row', href: '#/phrases', style: { textDecoration: 'none', color: 'inherit' } },
      h('div', { style: { fontSize: '30px' } }, '🧳'),
      h('div', { class: 'grow' }, h('div', { class: 'bold', style: { fontSize: '17px' } }, '생존 표현집'), h('div', { class: 'small text-2' }, '긴급·식당·쇼핑·교통·숙소 — 바로 쓰는 문장 모음')),
      icon('chev-right', 20),
    ),
    h('div', { class: 'list mt-16' }, DIALOGUES.map((d) => h('a', { class: 'list-item', href: `#/talk/${d.id}` },
      h('div', { class: 'li-icon', style: { fontSize: '22px' } }, d.emoji),
      h('div', { class: 'li-main' }, h('div', { class: 'li-title' }, d.title), h('div', { class: 'li-sub' }, `${d.tr} · ${d.lines.length}줄`)),
      talks()[d.id]?.done ? h('span', { class: 'badge ok' }, '연습함') : h('span', { class: 'badge' }, d.level),
      icon('chev-right', 18),
    ))),
  );
}

function detail(root, d) {
  let hideKo = false;
  let playing = 0;
  const chat = h('div', { class: 'chat' });
  const renderChat = () => chat.replaceChildren(...d.lines.map((l) => bubble(d, l, { hideKo })));
  renderChat();
  const playBtn = h('button', { class: 'btn btn-primary', type: 'button' }, icon('play', 18), '전체 듣기');
  playBtn.addEventListener('click', async () => {
    if (playing) { playing = 0; stopSpeaking(); playBtn.replaceChildren(icon('play', 18), '전체 듣기'); return; }
    const my = ++playing;
    playBtn.replaceChildren(icon('x', 18), '멈추기');
    const rows = [...chat.children];
    for (let i = 0; i < d.lines.length && playing === my; i++) {
      rows.forEach((r) => r.classList.remove('now'));
      rows[i].classList.add('now');
      rows[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
      await speak(d.lines[i][1]);
      await new Promise((r) => setTimeout(r, 350));
    }
    rows.forEach((r) => r.classList.remove('now'));
    if (playing === my) { playing = 0; playBtn.replaceChildren(icon('play', 18), '전체 듣기'); }
  });
  const koBtn = h('button', { class: 'btn btn-outline', type: 'button' }, '번역 가리기');
  koBtn.addEventListener('click', () => { hideKo = !hideKo; koBtn.textContent = hideKo ? '번역 보기' : '번역 가리기'; renderChat(); });
  root.append(
    h('div', { class: 'page-head' },
      h('a', { class: 'small', href: '#/talk' }, '← 상황별 회화'),
      h('h1', { class: 'mt-4' }, `${d.emoji} ${d.title}`),
      h('p', null, `${d.tr} · ${d.level}`),
    ),
    h('div', { class: 'row wrap' }, playBtn, koBtn),
    h('p', { class: 'small muted mt-8' }, '문장을 누르면 그 줄만 들려요. 번역을 가리고 먼저 뜻을 떠올려 보세요.'),
    chat,
    h('div', { class: 'card flat mt-16' },
      h('div', { class: 'bold' }, '🔑 핵심 표현'),
      h('div', { class: 'ex-list mt-8' }, d.keys.map(([tr, ko]) => h('div', { class: 'ex-line' }, speakBtn(tr.replace(/…/g, ''), { size: 'sm' }), h('div', { class: 'grow' }, h('div', { class: 'ex-tr' }, tr), h('div', { class: 'ex-ko' }, ko))))),
    ),
    h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '역할 연습')),
    h('p', { class: 'small text-2', style: { margin: '-4px 2px 10px' } }, `내가 맡은 역할의 대사를 직접 만들어요${sttSupported ? ' (일부는 말하기)' : ''}. 상대 대사는 들려줘요.`),
    h('div', { class: 'grid-2' }, ['A', 'B'].map((role) => h('a', { class: 'btn btn-soft btn-lg', href: `#/talk/${d.id}/practice/${role}` }, `${d.roles[role].emoji} ${d.roles[role].name} 역할`))),
  );
  return () => { playing = 0; };
}

function renderLine(step, api) {
  const el = h('div', { class: 'ex' },
    h('div', { class: 'ex-label' }, icon('message', 16), `${step.d.roles[step.line[0]].name}의 말`),
    h('div', { class: 'chat' }, bubble(step.d, step.line, { me: step.me })),
    h('div', { class: 'row', style: { justifyContent: 'center' } }, speakBtn(step.line[1], { size: 'xl' }), speakBtn(step.line[1], { size: 'xl', slow: true })),
  );
  return { el, info: true, onShow: () => speak(step.line[1]) };
}

function practice(root, d, role, go) {
  const me = role === 'B' ? 'B' : 'A';
  const myLines = d.lines.map((l, i) => ({ l, i })).filter(({ l }) => l[0] === me);
  const otherTexts = d.lines.map((l) => l[1]);
  let mine = 0;
  const steps = d.lines.map((line) => {
    if (line[0] !== me) return { type: 'line', d, line, me };
    mine++;
    const [, tr, ko] = line;
    const tokens = tokenize(tr);
    if (sttSupported && state.settings.speaking !== false && mine % 2 === 0) return { type: 'speak', tr, ko };
    if (tokens.length >= 2) return { type: 'tiles', tr, ko, tokens, extra: tileDistractors(tr, otherTexts.filter((t) => t !== tr), 3), key: null };
    return { type: 'typeSent', tr, ko, key: null };
  });
  return runSession(root, {
    steps,
    renderers: { line: renderLine },
    onExit: () => go(`#/talk/${d.id}`),
    onFinish: (sum) => {
      const xp = 5 + myLines.length * 2;
      talks()[d.id] = { done: true, at: Date.now() };
      commit();
      addXP(xp);
      sfxComplete();
      renderDone(root, {
        emoji: '🗣️',
        title: '역할 연습 완료!',
        sub: `${d.title} — ${d.roles[me].name} 역할을 해냈어요.`,
        stats: [
          { v: `${Math.round(sum.acc * 100)}%`, k: '정확도', cls: 'ok' },
          { v: `+${xp}`, k: 'XP', cls: 'gold' },
          { v: fmtDuration(sum.ms), k: '시간', cls: 'brand' },
        ],
        buttons: [
          { label: '상대 역할로 해 보기', cls: 'btn-primary', onClick: () => go(`#/talk/${d.id}/practice/${me === 'A' ? 'B' : 'A'}`) },
          { label: '대화 다시 보기', onClick: () => go(`#/talk/${d.id}`) },
        ],
      });
    },
  });
}

export default {
  tab: 'learn',
  title: (p) => (p[0] ? DIALOGUE.get(p[0])?.title || '회화' : '상황별 회화'),
  immersive: (p) => p[1] === 'practice',
  render(root, [id, mode, role], { go }) {
    if (!id) { list(root); return null; }
    const d = DIALOGUE.get(id);
    if (!d) { go('#/talk'); return null; }
    if (mode === 'practice') return practice(root, d, role, go);
    return detail(root, d);
  },
};
