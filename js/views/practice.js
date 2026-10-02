import { h, icon } from '../core/ui.js';
import { state } from '../core/store.js';
import { DRILL_LIST, learnedWords } from './drill.js';
import { canListen } from './lesson.js';
import { sttSupported } from '../core/stt.js';

const TINT = {
  quiz: '#f0a020', listen: '#2b72e8', build: '#7356f0', type: '#0e9f9a', dictation: '#d63f7f', speak: '#e5484d', pairs: '#e2700c', weak: '#e2700c',
  harmony: '#0891b2', cases: '#2b72e8', poss: '#e2700c', copula: '#d63f7f', conj: '#15a34a', numbers: '#a16207', time: '#0f766e',
};

function drillList(items, audio) {
  return h('div', { class: 'list' }, items.map((d) => {
    const best = state.drills[d.id]?.best;
    const count = d.count?.();
    const disabled = (d.needsAudio && !audio) || (d.needsMic && !sttSupported);
    return h('a', { class: 'list-item', href: `#/drill/${d.id}`, style: disabled ? { opacity: 0.55 } : null },
      h('div', { class: 'li-icon', style: { background: `color-mix(in srgb, ${TINT[d.id]} 15%, transparent)` } }, d.emoji),
      h('div', { class: 'li-main' },
        h('div', { class: 'li-title' }, d.title, count ? h('span', { class: 'badge bad', style: { marginLeft: '8px' } }, String(count)) : null),
        h('div', { class: 'li-sub' }, disabled ? (d.needsMic ? '음성 인식 지원 브라우저 필요(크롬·사파리)' : '튀르키예어 음성이 필요해요') : d.desc),
      ),
      best ? h('span', { class: 'badge ok' }, `최고 ${Math.round(best * 100)}%`) : null,
      icon('chev-right', 20),
    );
  }));
}

export default {
  tab: 'practice',
  title: '연습',
  render(root) {
    const n = learnedWords().length;
    const audio = canListen();
    root.append(
      h('div', { class: 'page-head' },
        h('h1', null, '연습'),
        h('p', null, n ? `배운 단어 ${n}개와 끝낸 레슨의 문장으로 연습해요.` : '레슨을 하면 연습 재료가 늘어나요. 지금은 기초 단어로 연습할 수 있어요.'),
      ),
      h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '단어·듣기·문장')),
      drillList(DRILL_LIST.filter((d) => d.group === 'vocab'), audio),
      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '숫자·시간')),
      drillList(DRILL_LIST.filter((d) => d.group === 'num'), audio),
      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '문법 드릴'), h('a', { class: 'section-link', href: '#/grammar' }, '문법 노트')),
      h('p', { class: 'small text-2', style: { margin: '-4px 2px 10px' } }, '어미가 붙는 규칙을 몸에 익히는 무한 문제 — 정답 뒤에 형태소가 색깔별로 풀이돼요.'),
      drillList(DRILL_LIST.filter((d) => d.group === 'grammar'), audio),
      h('section', { class: 'section' },
        h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '발음 기초')),
        h('a', { class: 'list-item list', href: '#/alphabet' },
          h('div', { class: 'li-icon', style: { background: 'color-mix(in srgb, #e5484d 14%, transparent)' } }, '🔤'),
          h('div', { class: 'li-main' }, h('div', { class: 'li-title' }, '알파벳과 발음 규칙'), h('div', { class: 'li-sub' }, '29글자, 한글 대응, 한국인이 틀리기 쉬운 소리')),
          icon('chev-right', 20),
        ),
      ),
      h('div', { class: 'card flat mt-16' },
        h('div', { class: 'bold' }, '💡 효과적인 연습 순서'),
        h('p', { class: 'small text-2 mt-4' }, '① 복습 카드 먼저 → ② 새 레슨 → ③ 문법 드릴 1세트 → ④ 약점 공략. 매일 15분이 주말 3시간보다 효과적이에요(분산 학습 효과).'),
      ),
    );
  },
};
