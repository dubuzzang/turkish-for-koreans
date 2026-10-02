// 문법 노트: 목록 · 상세 (예문 듣기, 표, 한국어 비교, 연습 링크)
import { h, icon, speakBtn, hangulEl, openSheet, tapToSpeak } from '../core/ui.js';
import { NOTES, NOTE } from '../data/notes.js';
import { UNITS } from '../data/curriculum.js';

export function renderNoteBody(note, { inSheet = false } = {}) {
  const box = h('div', { class: 'prose' });
  for (const s of note.sections) {
    if (s.h) box.append(h('h3', null, s.h));
    else if (s.p) box.append(h('p', { html: s.p }));
    else if (s.table) {
      box.append(h('div', { class: 'table-scroll' }, h('table', { class: 'gtable' },
        h('thead', null, h('tr', null, s.table.head.map((c) => h('th', { html: c })))),
        h('tbody', null, s.table.rows.map((r) => h('tr', null, r.map((c) => h('td', { html: c }))))),
      )));
    } else if (s.ex) {
      box.append(h('div', { class: 'ex-list' }, s.ex.map(([tr, ko, gloss]) => h('div', { class: 'ex-line' },
        speakBtn(tr, { size: 'sm' }),
        h('div', { class: 'grow' },
          h('div', { class: 'ex-tr' }, tr),
          hangulEl(tr, 'hangul tiny'),
          h('div', { class: 'ex-ko' }, ko),
          gloss ? h('div', { class: 'ex-gloss' }, gloss) : null,
        ),
      ))));
    } else if (s.tip) {
      box.append(h('div', { class: 'note ko' }, h('div', { class: 'note-title' }, '💡 한국어와 비교'), h('div', { html: s.tip })));
    } else if (s.warn) {
      box.append(h('div', { class: 'note warn' }, h('div', { class: 'note-title' }, '⚠️ 주의'), h('div', { html: s.warn })));
    } else if (s.drill && !inSheet) {
      box.append(h('a', { class: 'btn btn-soft btn-block', href: `#/drill/${s.drill}` }, icon('target', 18), s.label || '연습하기'));
    }
  }
  return tapToSpeak(box);
}

export function openNoteSheet(id) {
  const note = NOTE.get(id);
  if (!note) return;
  openSheet({
    title: note.title,
    body: h('div', null, h('p', { class: 'small muted', style: { margin: '-6px 0 12px' } }, note.sub), renderNoteBody(note, { inSheet: true })),
  });
}

function unitOfNote(id) {
  return UNITS.find((u) => (u.notes || []).includes(id));
}

export default {
  tab: 'learn',
  title: (p) => (p[0] ? NOTE.get(p[0])?.title || '문법 노트' : '문법 노트'),
  render(root, [id], { go }) {
    if (id) {
      const note = NOTE.get(id);
      if (!note) { go('#/grammar'); return; }
      const idx = NOTES.indexOf(note);
      const prev = NOTES[idx - 1], next = NOTES[idx + 1];
      root.append(
        h('div', { class: 'page-head' },
          h('a', { class: 'small', href: '#/grammar' }, '← 문법 노트'),
          h('h1', { class: 'mt-4' }, note.title),
          h('p', null, note.sub),
        ),
        h('div', { class: 'card' }, renderNoteBody(note)),
        h('p', { class: 'small muted mt-12' }, '굵은 튀르키예어나 🔊를 누르면 발음을 들을 수 있어요.'),
        h('div', { class: 'row mt-16' },
          prev ? h('a', { class: 'btn btn-outline grow', href: `#/grammar/${prev.id}` }, icon('chev-left', 18), prev.title) : h('span', { class: 'grow' }),
          next ? h('a', { class: 'btn btn-outline grow', href: `#/grammar/${next.id}` }, next.title, icon('chev-right', 18)) : h('span', { class: 'grow' }),
        ),
      );
      return;
    }
    root.append(
      h('div', { class: 'page-head' },
        h('a', { class: 'small', href: '#/learn' }, '← 학습 경로'),
        h('h1', { class: 'mt-4' }, '문법 노트'),
        h('p', null, '한국어와 비교하며 정리한 핵심 문법이에요. 레슨 중 막히면 여기서 찾아보세요.'),
      ),
      h('div', { class: 'list' }, NOTES.map((n, i) => {
        const u = unitOfNote(n.id);
        return h('a', { class: 'list-item', href: `#/grammar/${n.id}` },
          h('div', { class: 'li-icon', style: { fontSize: '15px', fontWeight: 800 } }, String(i + 1)),
          h('div', { class: 'li-main' }, h('div', { class: 'li-title' }, n.title), h('div', { class: 'li-sub' }, n.sub)),
          u ? h('span', { class: 'badge', style: { background: `color-mix(in srgb, ${u.color} 14%, transparent)`, color: u.color } }, `${u.no}단원`) : null,
          icon('chev-right', 18),
        );
      })),
    );
  },
};
