import { h, icon, bar, stars } from '../core/ui.js';
import { state } from '../core/store.js';
import { UNITS, LESSONS } from '../data/curriculum.js';
import { LETTERS } from '../data/alphabet.js';
import { nextLesson } from './home.js';

export default {
  tab: 'learn',
  title: '학습',
  render(root) {
    const doneCount = LESSONS.filter((l) => state.lessons[l.id]?.done).length;
    const nl = nextLesson();
    const seenLetters = Object.keys(state.letters || {}).length;

    root.append(
      h('div', { class: 'page-head' },
        h('h1', null, '학습 경로'),
        h('p', null, `레슨 ${doneCount} / ${LESSONS.length} 완료 — 순서대로 하면 가장 효과적이에요.`),
        h('div', { class: 'mt-12' }, bar(doneCount / LESSONS.length)),
      ),
      h('a', { class: 'card tap row', href: '#/alphabet', style: { textDecoration: 'none', color: 'inherit' } },
        h('div', { class: 'li-icon', style: { width: '52px', height: '52px', borderRadius: '16px', display: 'grid', placeItems: 'center', fontSize: '26px', background: 'color-mix(in srgb, #e5484d 14%, transparent)' } }, '🔤'),
        h('div', { class: 'grow' },
          h('div', { class: 'tiny bold muted' }, '0단원 · 시작 전에'),
          h('div', { class: 'bold', style: { fontSize: '17px' } }, '발음과 알파벳'),
          h('div', { class: 'small text-2' }, `29글자 · 한국인이 헷갈리는 소리 · ${seenLetters}/${LETTERS.length} 확인`),
        ),
        icon('chev-right', 20),
      ),
    );

    for (const u of UNITS) {
      const done = u.lessons.filter((l) => state.lessons[l.id]?.done).length;
      const unitEl = h('section', { class: 'unit', style: { '--unit-color': u.color } });
      unitEl.style.setProperty('--unit-color', u.color);
      unitEl.append(
        h('div', { class: 'unit-head', style: { background: u.color } },
          h('div', { class: 'u-kicker' }, `UNIT ${u.no}`),
          h('div', { class: 'u-title' }, u.title),
          h('div', { class: 'u-tr' }, u.tr),
          h('div', { class: 'u-desc' }, u.desc),
          h('div', { class: 'u-progress' }, h('span', null, `${done}/${u.lessons.length}`), bar(done / u.lessons.length)),
          u.notes?.length ? h('div', { class: 'u-notes' }, u.notes.map((n) => h('a', { class: 'u-note', href: `#/grammar/${n.id}` }, icon('bulb', 14), n.title))) : null,
        ),
        h('div', { class: 'lesson-list' }, u.lessons.map((l, i) => {
          const rec = state.lessons[l.id];
          const isNext = nl && nl.id === l.id;
          return h('a', { class: `lesson-item ${rec?.done ? 'done' : ''} ${isNext ? 'next' : ''}`, href: `#/lesson/${l.id}` },
            h('div', { class: 'lesson-dot' }, rec?.done ? icon('check', 22) : String(i + 1)),
            h('div', { class: 'grow' },
              h('div', { class: 'l-title' }, l.title),
              h('div', { class: 'l-sub' }, l.tr),
            ),
            rec?.done ? stars(rec.stars || 1) : isNext ? h('span', { class: 'badge brand' }, '다음') : icon('chev-right', 18),
          );
        })),
      );
      root.append(unitEl);
    }

    root.append(h('div', { class: 'footer-note' }, '새 단원이 계속 추가될 예정이에요.'));
  },
};
