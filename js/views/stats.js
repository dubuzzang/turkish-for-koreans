// 학습 통계: 요약 타일 · 30일 XP · 12주 활동 히트맵 · 7일 복습 예보 · 단원 진행
import { h, bar } from '../core/ui.js';
import { state, dayKey, streakNow } from '../core/store.js';
import { deckStats } from '../core/deck.js';
import { addDays, startOfDay } from '../core/srs.js';
import { UNITS, LESSONS } from '../data/curriculum.js';

const WD = ['일', '월', '화', '수', '목', '금', '토'];
const fmtDate = (d) => `${d.getMonth() + 1}/${d.getDate()}(${WD[d.getDay()]})`;
const compact = (n) => (n >= 10000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : n.toLocaleString('ko-KR'));

/** 막대·셀에 붙이는 툴팁 (값이 먼저, 라벨이 다음) */
function tooltipLayer(box) {
  const tip = h('div', { class: 'viz-tip', role: 'status', hidden: true });
  box.append(tip);
  const show = (el, value, label) => {
    tip.replaceChildren(h('b', null, value), h('span', null, label));
    tip.hidden = false;
    const b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2 - b.left, 50), b.width - 50);
    tip.style.left = `${x}px`;
    tip.style.top = `${r.top - b.top - 8}px`;
  };
  const hide = () => { tip.hidden = true; };
  return { show, hide, bind(el, value, label) {
    el.tabIndex = 0;
    el.setAttribute('aria-label', `${label} ${value}`);
    el.addEventListener('pointerenter', () => show(el, value, label));
    el.addEventListener('pointerdown', () => show(el, value, label));
    el.addEventListener('focus', () => show(el, value, label));
    el.addEventListener('pointerleave', hide);
    el.addEventListener('blur', hide);
  } };
}

function tableView(head, rows) {
  return h('details', { class: 'viz-table' },
    h('summary', null, '표로 보기'),
    h('table', { class: 'gtable mt-8' },
      h('thead', null, h('tr', null, head.map((c) => h('th', null, c)))),
      h('tbody', null, rows.map((r) => h('tr', null, r.map((c) => h('td', null, String(c)))))),
    ),
  );
}

function columns({ data, height = 120, goal = null, labelIdx = [] }) {
  // data: [{ label, value, sub }]
  const max = Math.max(1, goal || 0, ...data.map((d) => d.value));
  const box = h('div', { class: 'viz' });
  const plot = h('div', { class: 'viz-cols', style: { height: `${height}px` } });
  const tt = tooltipLayer(box);
  data.forEach((d, i) => {
    const col = h('div', { class: 'viz-col' });
    const barEl = h('div', { class: `viz-bar ${d.value ? '' : 'zero'}`, style: { height: `${Math.max(d.value ? 3 : 2, (d.value / max) * (height - 22))}px` } });
    if (labelIdx.includes(i) && d.value) col.append(h('div', { class: 'viz-cap' }, compact(d.value)));
    col.append(barEl);
    tt.bind(col, `${d.value.toLocaleString('ko-KR')}${d.unit || ''}`, d.sub || d.label);
    plot.append(col);
  });
  if (goal) {
    const y = (goal / max) * (height - 22);
    plot.append(h('div', { class: 'viz-goal', style: { bottom: `${y}px` }, 'aria-hidden': 'true' }));
  }
  const axis = h('div', { class: 'viz-axis' }, data.map((d) => h('div', null, d.tick || '')));
  box.prepend(plot, axis);
  return box;
}

function heatmap(weeks = 12) {
  const today = new Date();
  const todayKey = dayKey();
  // 이번 주 월요일 기준으로 weeks주 전부터
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset - (weeks - 1) * 7);
  const vals = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
      const k = dayKey(0, dt);
      vals.push({ dt, k, xp: state.xp.days[k] || 0, future: dt > today && k !== todayKey });
    }
  }
  const goal = state.settings.goal || 40;
  const level = (xp) => (xp <= 0 ? 0 : xp < goal * 0.5 ? 1 : xp < goal ? 2 : xp < goal * 2 ? 3 : 4);
  const box = h('div', { class: 'viz' });
  const tt = tooltipLayer(box);
  const grid = h('div', { class: 'heat', style: { gridTemplateColumns: `24px repeat(${weeks}, 1fr)` } });
  for (let d = 0; d < 7; d++) {
    grid.append(h('div', { class: 'heat-wd' }, d % 2 === 0 ? ['월', '화', '수', '목', '금', '토', '일'][d] : ''));
    for (let w = 0; w < weeks; w++) {
      const v = vals[w * 7 + d];
      const cell = h('div', { class: `heat-cell l${level(v.xp)} ${v.future ? 'future' : ''} ${v.k === todayKey ? 'today' : ''}` });
      if (!v.future) tt.bind(cell, `${v.xp} XP`, fmtDate(v.dt));
      grid.append(cell);
    }
  }
  box.prepend(grid,
    h('div', { class: 'heat-legend' }, h('span', null, '적음'), [0, 1, 2, 3, 4].map((l) => h('i', { class: `heat-cell l${l}` })), h('span', null, '많음')),
  );
  return box;
}

export default {
  tab: 'home',
  title: '학습 통계',
  render(root) {
    const s = deckStats();
    const doneLessons = LESSONS.filter((l) => state.lessons[l.id]?.done).length;
    let ok = 0, bad = 0;
    for (let i = 0; i < 7; i++) { const d = state.stats.days[dayKey(-i)]; if (d) { ok += d.ok || 0; bad += d.bad || 0; } }
    const acc = ok + bad ? Math.round((ok / (ok + bad)) * 100) : null;

    const tile = (v, k, cls = '') => h('div', { class: `stat-tile ${cls}` }, h('div', { class: 'v' }, v), h('div', { class: 'k' }, k));

    // 30일 XP
    const days30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dayKey(-i);
      days30.push({ label: k, value: state.xp.days[k] || 0, sub: fmtDate(d), tick: i === 29 || i === 15 || i === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : '', unit: ' XP' });
    }
    const maxIdx = days30.reduce((m, d, i) => (d.value > days30[m].value ? i : m), 0);

    // 7일 복습 예보
    const now = Date.now();
    const sod = startOfDay(now);
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const from = i === 0 ? -Infinity : addDays(sod, i);
      const to = addDays(sod, i + 1);
      const n = Object.values(state.cards).filter((c) => !c.suspended && c.due >= from && c.due < to).length;
      const d = new Date(addDays(sod, i));
      return { label: fmtDate(d), value: n, sub: i === 0 ? '오늘(밀린 카드 포함)' : fmtDate(d), tick: i === 0 ? '오늘' : WD[d.getDay()], unit: '장' };
    });
    const fMax = forecast.reduce((m, d, i) => (d.value > forecast[m].value ? i : m), 0);

    root.append(
      h('div', { class: 'page-head' }, h('a', { class: 'small', href: '#/home' }, '← 홈'), h('h1', { class: 'mt-4' }, '학습 통계')),
      h('div', { class: 'stat-tiles' },
        tile(compact(state.xp.total), '총 XP', 'gold'),
        tile(`${streakNow()}일`, `연속 학습 · 최고 ${state.streak.best || 0}일`, 'accent'),
        tile(String(s.words), '학습한 단어', 'brand'),
      ),
      h('div', { class: 'stat-tiles mt-12' },
        tile(String(s.mature), '장기 기억 단어'),
        tile(`${doneLessons}/${LESSONS.length}`, '완료한 레슨'),
        tile(acc == null ? '–' : `${acc}%`, '최근 7일 정답률'),
      ),
      h('section', { class: 'section' },
        h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '최근 30일 XP'), h('div', { class: 'small muted' }, `가로선 = 하루 목표 ${state.settings.goal || 40} XP`)),
        h('div', { class: 'card' }, columns({ data: days30, goal: state.settings.goal || 40, labelIdx: [maxIdx, 29] }),
          tableView(['날짜', 'XP'], days30.filter((d) => d.value).map((d) => [d.sub, d.value]))),
      ),
      h('section', { class: 'section' },
        h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '12주 학습 기록'), h('div', { class: 'small muted' }, '색이 진할수록 많이')),
        h('div', { class: 'card' }, heatmap(12)),
      ),
      h('section', { class: 'section' },
        h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '앞으로 7일 복습 예보'), h('div', { class: 'small muted' }, `카드 ${Object.keys(state.cards).length}장`)),
        h('div', { class: 'card' }, columns({ data: forecast, height: 110, labelIdx: [0, fMax] }),
          tableView(['날짜', '복습 카드'], forecast.map((d) => [d.sub, d.value]))),
      ),
      h('section', { class: 'section' },
        h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '단원별 진행')),
        h('div', { class: 'card col', style: { gap: '12px' } }, UNITS.map((u) => {
          const done = u.lessons.filter((l) => state.lessons[l.id]?.done).length;
          return h('div', null,
            h('div', { class: 'row between small' }, h('span', { class: 'bold' }, `${u.no}. ${u.title}`), h('span', { class: 'muted' }, `${done}/${u.lessons.length}`)),
            h('div', { class: 'mt-4' }, bar(done / u.lessons.length, 'thin')),
          );
        })),
      ),
    );
  },
};
