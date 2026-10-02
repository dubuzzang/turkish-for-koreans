// 첫 실행 안내: 소개 → 목적 → 하루 목표 → 음성 확인 → 시작 지점
import { h, icon, speakBtn, setKids } from '../core/ui.js';
import { state, commit } from '../core/store.js';
import { hasTurkishVoice, ttsSupported, onVoicesChanged, speak } from '../core/tts.js';
import { voiceGuide } from './settings.js';

const PURPOSES = [
  ['travel', '✈️', '여행', '이스탄불·카파도키아에서 써먹기'],
  ['culture', '🎬', '드라마·문화', '튀르키예 드라마와 음악 즐기기'],
  ['study', '🎓', '유학·이민', '현지 생활과 공부 준비'],
  ['work', '💼', '일·비즈니스', '동료·거래처와 소통'],
  ['fun', '🧩', '그냥 재미로', '새로운 언어 탐험'],
];
const GOALS = [[20, '가볍게', '하루 5분'], [40, '보통', '하루 10분 (추천)'], [80, '열심히', '하루 20분']];

export function renderOnboarding(root, onDone) {
  let step = 0;
  const total = 4;
  const wrap = h('div', { class: 'onb' });
  root.replaceChildren(wrap);

  const dots = () => h('div', { class: 'onb-dots', 'aria-hidden': 'true' }, Array.from({ length: total }, (_, i) => h('i', { class: i === step ? 'on' : '' })));
  const nextBtn = (label, onClick, cls = 'btn-primary') => h('button', { class: `btn ${cls} btn-lg btn-block`, type: 'button', onclick: onClick }, label);

  function show() {
    let body, foot;
    if (step === 0) {
      body = h('div', { class: 'onb-body' },
        h('div', { class: 'onb-hero', 'aria-hidden': 'true' }, '🧿'),
        h('div', { class: 'onb-title' }, 'Merhaba!', h('br'), '한국인을 위한 튀르키예어'),
        h('div', { class: 'onb-sub' }, '튀르키예어는 한국어와 어순·조사·모음조화까지 닮았어요. 그 장점을 살려 배워요.'),
        h('div', { class: 'onb-points' },
          [['🤝', '한국어와 비교하는 문법', 'evde = 집에서, okula = 학교에 — 조사처럼 붙여요'],
            ['🧠', '과학적 간격 반복', '잊기 직전에 다시 보여 주는 FSRS 복습'],
            ['🎧', '듣기·쓰기·문장 조립', '모든 단어와 예문을 소리로'],
            ['📱', '하루 10분, 모바일 최적화', '짧은 레슨과 자동 저장']].map(([e, t, s]) =>
            h('div', { class: 'onb-point' }, h('div', { class: 'op-ico' }, e), h('div', null, h('b', null, t), h('span', null, s))))),
      );
      foot = nextBtn('시작하기', () => { step++; show(); });
    } else if (step === 1) {
      body = h('div', { class: 'onb-body' },
        h('div', { class: 'onb-title' }, '튀르키예어를 배우는 이유는?'),
        h('div', { class: 'onb-sub' }, '학습 팁을 맞춤으로 보여 드릴게요.'),
        h('div', { class: 'options' }, PURPOSES.map(([id, e, t, s]) => {
          const b = h('button', { class: `option ${state.settings.purpose === id ? 'sel' : ''}`, type: 'button' },
            h('span', { style: { fontSize: '24px' } }, e), h('span', { class: 'opt-text' }, t, h('span', { class: 'opt-sub' }, s)));
          b.addEventListener('click', () => { state.settings.purpose = id; commit(); step++; show(); });
          return b;
        })),
      );
      foot = nextBtn('건너뛰기', () => { step++; show(); }, 'btn-ghost');
    } else if (step === 2) {
      body = h('div', { class: 'onb-body' },
        h('div', { class: 'onb-title' }, '하루 목표를 정해요'),
        h('div', { class: 'onb-sub' }, '꾸준함이 가장 중요해요. 나중에 설정에서 바꿀 수 있어요.'),
        h('div', { class: 'options' }, GOALS.map(([xp, t, s]) => {
          const b = h('button', { class: `option ${state.settings.goal === xp ? 'sel' : ''}`, type: 'button' },
            h('span', { class: 'opt-text' }, t, h('span', { class: 'opt-sub' }, `${s} · ${xp} XP`)));
          b.addEventListener('click', () => { state.settings.goal = xp; commit(); step++; show(); });
          return b;
        })),
      );
      foot = null;
    } else {
      const status = h('div');
      const renderStatus = () => {
        const ok = ttsSupported && hasTurkishVoice();
        status.replaceChildren(ok
          ? h('div', { class: 'note ko' }, '✅ 튀르키예어 음성을 찾았어요. 버튼을 눌러 들어 보세요!')
          : h('div', { class: 'note warn' }, h('div', { class: 'note-title' }, '튀르키예어 음성이 없어요'), '지금도 공부할 수 있지만, 발음을 들으려면 음성을 설치하는 걸 추천해요.', h('details', { class: 'mt-8' }, h('summary', { class: 'bold', style: { cursor: 'pointer' } }, '설치 방법 보기'), h('div', { class: 'mt-8' }, voiceGuide()))));
      };
      renderStatus();
      const off = onVoicesChanged(renderStatus);
      const hangulInput = h('input', { type: 'checkbox', role: 'switch', 'aria-label': '한글 발음 표기' });
      hangulInput.checked = state.settings.hangul;
      hangulInput.addEventListener('change', () => { state.settings.hangul = hangulInput.checked; commit(); });
      body = h('div', { class: 'onb-body' },
        h('div', { class: 'onb-title' }, '소리를 확인해요'),
        h('div', { class: 'play-row' }, speakBtn('Merhaba!', { size: 'xl' }), speakBtn('Merhaba!', { size: 'xl', slow: true })),
        h('div', { class: 'center bold', style: { fontSize: '22px' } }, 'Merhaba! ', h('span', { class: 'muted', style: { fontSize: '15px' } }, '[메르하바] 안녕하세요')),
        status,
        h('div', { class: 'list' }, h('div', { class: 'field' },
          h('div', { class: 'f-main' }, h('div', { class: 'f-title' }, '한글 발음 표기 보기'), h('div', { class: 'f-sub' }, '처음엔 켜 두는 걸 추천해요')),
          h('label', { class: 'switch' }, hangulInput, h('span')),
        )),
      );
      const finish = (hash) => {
        off();
        state.settings.onboarded = true;
        commit();
        location.hash = hash;
        onDone();
      };
      foot = h('div', { class: 'col' },
        nextBtn('발음·알파벳부터 시작 (추천)', () => finish('#/alphabet')),
        nextBtn('바로 1단원 시작', () => finish('#/lesson/u1l1'), 'btn-outline'),
      );
      setTimeout(() => speak('Merhaba!'), 300);
    }
    setKids(wrap,
      h('div', { class: 'row between' },
        step > 0 ? h('button', { class: 'icon-btn', type: 'button', 'aria-label': '이전', onclick: () => { step--; show(); } }, icon('chev-left', 24)) : h('span'),
        dots(),
        h('span', { style: { width: '42px' } }),
      ),
      body,
      foot ? h('div', { class: 'mt-16' }, foot) : null,
    );
  }
  show();
}
