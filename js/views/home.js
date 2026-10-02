import { h, icon, ring, speakBtn, hangulEl } from '../core/ui.js';
import { state, xpToday, streakNow, dayKey } from '../core/store.js';
import { dueCount, deckStats } from '../core/deck.js';
import { speechAvailable, onVoicesChanged } from '../core/tts.js';
import { LESSONS } from '../data/curriculum.js';
import { DAILY } from '../data/daily.js';
import { GREETINGS } from '../data/speech.js';
import { VERSION } from '../version.js';

function greeting() {
  const hr = new Date().getHours();
  const g = [...GREETINGS].reverse().find(([from]) => hr >= from) || GREETINGS[GREETINGS.length - 1];
  return [g[1], g[2]];
}

export const nextLesson = () => LESSONS.find((l) => !state.lessons[l.id]?.done) || null;

function dayIndex() {
  const d = new Date();
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 864e5);
}

function weekChart() {
  const goal = state.settings.goal || 40;
  const labels = ['일', '월', '화', '수', '목', '금', '토'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const k = dayKey(-i);
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ k, xp: state.xp.days[k] || 0, label: labels[d.getDay()], today: i === 0 });
  }
  const max = Math.max(goal, ...days.map((d) => d.xp));
  return h('div', { class: 'week', role: 'img', 'aria-label': `최근 7일 XP: ${days.map((d) => `${d.label} ${d.xp}`).join(', ')}` },
    days.map((d) => h('div', { class: 'week-col' },
      h('div', { class: 'tiny muted bold' }, d.xp ? String(d.xp) : ''),
      h('div', { class: `week-bar ${d.xp >= goal ? 'hit' : ''} ${d.today ? 'today' : ''}`, style: { height: `${Math.max(4, (d.xp / max) * 84)}px` } }),
      h('div', { class: 'week-label' }, d.label),
    )));
}

export default {
  tab: 'home',
  title: null,
  render(root) {
    const [gTr, gKo] = greeting();
    const xp = xpToday();
    const goal = state.settings.goal || 40;
    const streak = streakNow();
    const due = dueCount();
    const nl = nextLesson();
    const stats = deckStats();

    const hero = h('section', { class: 'hero' },
      h('div', { class: 'hero-greet' }, h('span', { class: 'tr' }, gTr), speakBtn(gTr, { size: 'sm' })),
      h('div', { class: 'hero-sub' }, gKo),
      h('div', { class: 'hero-stats' },
        ring(xp / goal, { size: 76, stroke: 8, label: h('div', null, h('div', { style: { fontWeight: 850, fontSize: '19px' } }, String(xp)), h('div', { style: { fontSize: '11px', opacity: 0.85 } }, `/ ${goal} XP`)) }),
        h('div', { class: 'hero-stat-text' },
          h('div', null, xp >= goal ? '🎯 오늘 목표 달성!' : `오늘 목표까지 ${goal - xp} XP`),
          h('div', { class: 'mt-4' }, '🔥 ', h('b', null, String(streak)), '일 연속 · 📚 ', h('b', null, String(stats.words)), '단어'),
        ),
      ),
    );

    // 오늘의 학습 계획
    const planItem = (done, title, sub, href, emoji) => h('a', { class: 'list-item', href },
      h('div', { class: `plan-check ${done ? 'done' : ''}` }, done ? icon('check', 16) : null),
      h('div', { class: 'li-main' }, h('div', { class: 'li-title' }, `${emoji} ${title}`), h('div', { class: 'li-sub' }, sub)),
      icon('chev-right', 20),
    );
    const reviewedToday = (state.stats.days[dayKey()]?.rev || 0) > 0;
    const plan = h('section', { class: 'section' },
      h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '오늘의 학습')),
      h('div', { class: 'list' },
        stats.words === 0
          ? planItem(false, '복습 카드 만들기', '레슨을 끝내면 배운 단어가 복습 카드가 돼요', '#/review', '🃏')
          : planItem(due === 0, due ? `복습 카드 ${due}개` : '오늘 복습 완료', due ? '잊기 직전인 단어를 지금 복습해요' : reviewedToday ? '잘했어요! 내일 다시 만나요' : '지금은 복습할 카드가 없어요', '#/review', '🃏'),
        nl
          ? planItem(false, `다음 레슨 · ${nl.title}`, `${nl.unit.no}단원 ${nl.unit.title} — ${nl.tr}`, `#/lesson/${nl.id}`, '📘')
          : planItem(true, '모든 레슨 완료!', '연습 탭에서 실력을 다져 보세요', '#/practice', '🏆'),
        planItem(xp >= goal, `하루 목표 ${goal} XP`, xp >= goal ? '오늘 목표를 달성했어요!' : `${goal - xp} XP 남았어요`, '#/practice', '🎯'),
      ),
    );

    // 음성 안내 (녹음 음성을 못 불러왔고 기기 음성도 없을 때만)
    const voiceNote = h('div');
    const renderVoiceNote = () => {
      voiceNote.replaceChildren();
      if (!speechAvailable()) {
        voiceNote.append(h('div', { class: 'note warn mt-16' },
          h('div', { class: 'note-title' }, icon('volume', 14), '발음 음성을 불러오지 못했어요'),
          '인터넷에 연결되면 원어민 발음 음성이 나와요. 지하철처럼 연결이 약한 곳에서 쓰려면 ',
          h('a', { href: '#/settings' }, '설정에서 음성을 내려받아 두세요'),
          '.',
        ));
      }
    };
    renderVoiceNote();
    const off = onVoicesChanged(renderVoiceNote);

    // 오늘의 표현
    const [pTr, pKo, pNote] = DAILY[dayIndex() % DAILY.length];
    const phrase = h('section', { class: 'section' },
      h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '오늘의 표현')),
      h('div', { class: 'card phrase-card' },
        h('div', { class: 'row', style: { alignItems: 'flex-start' } },
          h('div', { class: 'grow' }, h('div', { class: 'tr' }, pTr), hangulEl(pTr), h('div', { class: 'ko mt-4' }, pKo)),
          speakBtn(pTr), speakBtn(pTr, { slow: true }),
        ),
        pNote ? h('div', { class: 'note ko mt-12' }, pNote) : null,
      ),
    );

    const quick = (href, emoji, bg, title, sub) => h('a', { class: 'quick', href },
      h('div', { class: 'q-ico', style: { background: bg } }, emoji),
      h('div', { class: 'q-title' }, title),
      h('div', { class: 'q-sub' }, sub),
    );
    const quickGrid = h('section', { class: 'section' },
      h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '빠른 연습'), h('a', { class: 'section-link', href: '#/practice' }, '전체 보기')),
      h('div', { class: 'quick-grid' },
        quick('#/alphabet', '🔤', 'color-mix(in srgb, #e5484d 16%, transparent)', '발음·알파벳', '29글자와 헷갈리는 소리'),
        quick('#/drill/quiz', '⚡', 'color-mix(in srgb, #f0a020 18%, transparent)', '단어 퀴즈', '배운 단어 빠르게 확인'),
        quick('#/drill/listen', '🎧', 'color-mix(in srgb, #2b72e8 16%, transparent)', '듣기 훈련', '귀를 튀르키예어에 맞추기'),
        quick('#/drill/build', '🧩', 'color-mix(in srgb, #7356f0 16%, transparent)', '문장 조립', '어순 감각 익히기'),
      ),
    );

    const week = h('section', { class: 'section' },
      h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '이번 주 학습'), h('a', { class: 'section-link', href: '#/stats' }, '통계 보기')),
      h('div', { class: 'card' }, weekChart()),
    );

    root.append(hero, voiceNote, plan, phrase, quickGrid, week,
      h('div', { class: 'footer-note' }, `Merhaba v${VERSION} · 한국인을 위한 튀르키예어`));
    return off;
  },
};
