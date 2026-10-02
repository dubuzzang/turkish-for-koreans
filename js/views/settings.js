import { h, icon, toast, confirmSheet, downloadText } from '../core/ui.js';
import { state, setSetting, exportJSON, importJSON, resetAll, dayKey } from '../core/store.js';
import { trVoices, currentVoice, setVoice, speak, onVoicesChanged, ttsSupported } from '../core/tts.js';
import { VERSION, RELEASED } from '../version.js';

const REPO = 'https://github.com/dubuzzang/turkish-for-koreans';

function field(title, sub, control) {
  return h('div', { class: control?.classList?.contains('seg') ? 'field stack' : 'field' }, h('div', { class: 'f-main' }, h('div', { class: 'f-title' }, title), sub ? h('div', { class: 'f-sub' }, sub) : null), control);
}

function sw(key, onChange) {
  const input = h('input', { type: 'checkbox', role: 'switch', 'aria-label': key });
  input.checked = !!state.settings[key];
  input.addEventListener('change', () => { setSetting(key, input.checked); onChange?.(input.checked); });
  return h('label', { class: 'switch' }, input, h('span'));
}

function seg(key, options, onChange) {
  const box = h('div', { class: 'seg' });
  const render = () => box.replaceChildren(...options.map(([v, label]) => h('button', {
    class: state.settings[key] === v ? 'on' : '', type: 'button',
    onclick: () => { setSetting(key, v); render(); onChange?.(v); },
  }, label)));
  render();
  return box;
}

export function voiceGuide() {
  return h('div', { class: 'col small text-2', style: { gap: '8px' } },
    h('div', null, h('b', null, '📱 아이폰·아이패드'), h('br'), '설정 → 손쉬운 사용 → 읽기 및 말하기 → 음성 → 튀르키예어 → "Yelda" 다운로드'),
    h('div', null, h('b', null, '🤖 안드로이드'), h('br'), '설정 → 일반(시스템) → 텍스트 음성 변환(TTS) → Google 음성 엔진 → 음성 데이터 설치 → 튀르키예어. Chrome 브라우저를 추천해요.'),
    h('div', null, h('b', null, '💻 Windows'), h('br'), '설정 → 시간 및 언어 → 음성 → 음성 추가 → 튀르키예어. Edge 브라우저는 자연스러운 온라인 음성을 바로 제공해요.'),
    h('div', null, h('b', null, '🍎 Mac'), h('br'), '시스템 설정 → 손쉬운 사용 → 읽기 및 말하기 → 시스템 음성 → 음성 관리 → 튀르키예어'),
    h('div', null, '설치 후 이 페이지를 새로고침하세요.'),
  );
}

export default {
  tab: null,
  title: '설정',
  render(root) {
    // 음성 선택
    const voiceSel = h('select', { class: 'select', 'aria-label': '음성 선택' });
    const voiceStatus = h('div', { class: 'f-sub' });
    const renderVoices = () => {
      const vs = trVoices();
      voiceSel.replaceChildren(h('option', { value: '' }, '자동 선택'), ...vs.map((v) => h('option', { value: v.voiceURI }, `${v.name}`)));
      voiceSel.value = state.settings.voice || '';
      voiceSel.disabled = !vs.length;
      voiceStatus.textContent = !ttsSupported ? '이 브라우저는 음성 합성을 지원하지 않아요' : vs.length ? `튀르키예어 음성 ${vs.length}개 · 사용 중: ${currentVoice()?.name || '-'}` : '튀르키예어 음성이 없어요 — 아래 설치 방법을 확인하세요';
    };
    voiceSel.addEventListener('change', () => { setVoice(voiceSel.value); setSetting('voice', voiceSel.value); renderVoices(); speak('Merhaba, nasılsınız?'); });
    renderVoices();
    const off = onVoicesChanged(renderVoices);

    const rateLabel = h('span', { class: 'badge brand' });
    const rate = h('input', { type: 'range', class: 'range', min: '0.6', max: '1.2', step: '0.05', 'aria-label': '음성 속도' });
    rate.value = String(state.settings.rate);
    const showRate = () => { rateLabel.textContent = `${Number(rate.value).toFixed(2)}×`; };
    showRate();
    rate.addEventListener('input', showRate);
    rate.addEventListener('change', () => { setSetting('rate', Number(rate.value)); speak('Türkçe öğreniyorum.'); });

    const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files?.[0];
      if (!f) return;
      try {
        importJSON(await f.text());
        toast('백업을 불러왔어요', 'ok');
        setTimeout(() => location.reload(), 600);
      } catch (e) {
        toast(e.message || '불러오기에 실패했어요', 'bad');
      }
      fileInput.value = '';
    });

    root.append(
      h('div', { class: 'page-head' }, h('h1', null, '설정')),

      h('div', { class: 'section-head' }, h('div', { class: 'section-title' }, '학습')),
      h('div', { class: 'list' },
        field('하루 목표', '홈 화면의 목표 링에 표시돼요', seg('goal', [[20, '가볍게'], [40, '보통'], [80, '열심히'], [120, '집중']])),
        field('하루 새 단어', '"새 단어 늘리기" 권장량', seg('newPerDay', [[5, '5'], [10, '10'], [15, '15'], [20, '20']])),
        field('목표 기억률', '높을수록 복습이 잦아져요(권장 90%)', seg('retention', [[0.85, '85%'], [0.9, '90%'], [0.95, '95%']])),
      ),

      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '소리')),
      h('div', { class: 'list' },
        h('div', { class: 'field' }, h('div', { class: 'f-main' }, h('div', { class: 'f-title' }, '음성'), voiceStatus), voiceSel),
        h('div', { class: 'field', style: { flexWrap: 'wrap' } },
          h('div', { class: 'f-main' }, h('div', { class: 'f-title' }, '말하기 속도 ', rateLabel), h('div', { class: 'f-sub' }, '🐢 버튼은 이 속도의 약 60%로 읽어요')),
          h('div', { style: { width: '100%' } }, rate),
        ),
        field('단어 자동 재생', '새 단어와 카드를 보여줄 때 바로 읽기', sw('autoplay')),
        field('듣기 문제 포함', '레슨에 "듣고 고르기" 문제 넣기', sw('listening')),
        field('효과음', '정답·오답 소리', sw('sfx')),
        field('진동', '지원하는 기기에서만', sw('vibrate')),
      ),
      h('details', { class: 'card flat mt-12' },
        h('summary', { class: 'bold', style: { cursor: 'pointer' } }, '🔈 튀르키예어 음성 설치 방법'),
        h('div', { class: 'mt-12' }, voiceGuide()),
      ),

      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '표시')),
      h('div', { class: 'list' },
        field('한글 발음 표기', '[메르하바]처럼 표시 — 익숙해지면 꺼 보세요', sw('hangul')),
        field('화면 테마', null, seg('theme', [['auto', '자동'], ['light', '라이트'], ['dark', '다크']])),
      ),

      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '데이터')),
      h('div', { class: 'list' },
        h('button', { class: 'list-item', type: 'button', onclick: () => { downloadText(`merhaba-backup-${dayKey()}.json`, exportJSON()); toast('백업 파일을 저장했어요', 'ok'); } },
          h('div', { class: 'li-icon' }, icon('download', 20)), h('div', { class: 'li-main' }, h('div', { class: 'li-title' }, '백업 내보내기'), h('div', { class: 'li-sub' }, '학습 기록을 파일로 저장 (기기 이동 시)'))),
        h('button', { class: 'list-item', type: 'button', onclick: () => fileInput.click() },
          h('div', { class: 'li-icon' }, icon('upload', 20)), h('div', { class: 'li-main' }, h('div', { class: 'li-title' }, '백업 불러오기'), h('div', { class: 'li-sub' }, '저장한 파일로 기록 복원'))),
        h('button', { class: 'list-item', type: 'button', onclick: async () => {
          if (await confirmSheet('레슨 기록, 복습 카드, XP가 모두 지워져요. 되돌릴 수 없어요.', { title: '모든 기록을 지울까요?', ok: '모두 지우기', danger: true })) {
            resetAll();
            location.hash = '#/home';
            location.reload();
          }
        } },
          h('div', { class: 'li-icon', style: { background: 'var(--bad-soft)', color: 'var(--bad-ink)' } }, icon('trash', 20)), h('div', { class: 'li-main' }, h('div', { class: 'li-title', style: { color: 'var(--bad)' } }, '모든 기록 초기화'), h('div', { class: 'li-sub' }, '처음부터 다시 시작'))),
      ),
      fileInput,
      h('p', { class: 'small muted mt-8', style: { margin: '8px 4px 0' } }, '학습 기록은 이 기기의 브라우저에만 저장돼요. 서버로 전송되지 않아요.'),

      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '정보')),
      h('div', { class: 'card' },
        h('div', { class: 'bold' }, `Merhaba v${VERSION}`),
        h('div', { class: 'small muted' }, `업데이트 ${RELEASED}`),
        h('p', { class: 'small text-2 mt-8' }, '한국어 화자를 위한 튀르키예어 학습 앱이에요. 한국어와 닮은 문법(어순·조사·모음조화)을 비교하며 배우고, 인출 연습과 간격 반복(FSRS)으로 오래 기억하도록 설계했어요.'),
        h('a', { class: 'btn btn-outline btn-sm mt-12', href: REPO, target: '_blank', rel: 'noopener' }, 'GitHub에서 보기'),
      ),
    );
    return off;
  },
};
