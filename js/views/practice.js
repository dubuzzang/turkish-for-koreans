import { h, icon } from '../core/ui.js';
import { state } from '../core/store.js';
import { DRILL_LIST, learnedWords } from './drill.js';
import { canListen } from './lesson.js';

const TINT = {
  quiz: '#f0a020', listen: '#2b72e8', build: '#7356f0', type: '#0e9f9a', dictation: '#d63f7f', pairs: '#e5484d', weak: '#e2700c',
};

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
      h('div', { class: 'list' }, DRILL_LIST.map((d) => {
        const best = state.drills[d.id]?.best;
        const count = d.count?.();
        const disabled = d.needsAudio && !audio;
        return h('a', { class: 'list-item', href: `#/drill/${d.id}`, style: disabled ? { opacity: 0.55 } : null },
          h('div', { class: 'li-icon', style: { background: `color-mix(in srgb, ${TINT[d.id]} 15%, transparent)` } }, d.emoji),
          h('div', { class: 'li-main' },
            h('div', { class: 'li-title' }, d.title, count ? h('span', { class: 'badge bad', style: { marginLeft: '8px' } }, String(count)) : null),
            h('div', { class: 'li-sub' }, disabled ? '튀르키예어 음성이 필요해요' : d.desc),
          ),
          best != null ? h('span', { class: 'badge ok' }, `최고 ${Math.round(best * 100)}%`) : null,
          icon('chev-right', 20),
        );
      })),
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
        h('p', { class: 'small text-2 mt-4' }, '① 복습 카드 먼저 → ② 새 레슨 → ③ 약점 공략 → ④ 듣기·받아쓰기. 매일 15분이 주말 3시간보다 효과적이에요(분산 학습 효과).'),
      ),
    );
  },
};
