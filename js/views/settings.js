import { h, icon, toast, confirmSheet, downloadText, speakBtn } from '../core/ui.js';
import { state, setSetting, exportJSON, importJSON, resetAll, dayKey } from '../core/store.js';
import { trVoices, currentVoice, setVoice, speak, onVoicesChanged, ttsSupported, recordingCount, recordingBytes, recordingIds, audioUrl, AUDIO_CACHE } from '../core/tts.js';
import { VOICE_SAMPLE, RATE_SAMPLE } from '../data/speech.js';
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

// ---------- 오프라인 음성 (녹음 파일을 기기에 보관) ----------
let dl = null; // 진행 중인 내려받기 — 설정 화면을 벗어나도 계속된다
const dlListeners = new Set();
const dlNotify = () => dlListeners.forEach((fn) => fn());

async function cachedAudioIds() {
  const c = await caches.open(AUDIO_CACHE);
  return new Set((await c.keys()).map((r) => new URL(r.url).pathname.split('/').pop().replace(/\.mp3$/, '')));
}

async function downloadAll() {
  if (dl) return;
  const ids = recordingIds();
  dl = { done: 0, total: ids.length, failed: 0, stop: false };
  dlNotify();
  try {
    await navigator.storage?.persist?.();
    const cache = await caches.open(AUDIO_CACHE);
    const have = await cachedAudioIds();
    const todo = ids.filter((id) => !have.has(id));
    dl.done = ids.length - todo.length;
    let i = 0;
    const worker = async () => {
      while (i < todo.length && !dl.stop) {
        const url = new URL(audioUrl(todo[i++]), location.href).href;
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res.ok && res.status === 200) await cache.put(url, res);
          else dl.failed++;
        } catch { dl.failed++; }
        dl.done++;
        if (dl.done % 25 === 0 || dl.done === dl.total) dlNotify();
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    if (dl.stop) toast('내려받기를 멈췄어요. 받은 음성은 그대로 남아 있어요');
    else if (dl.failed) toast(`${dl.failed}개를 받지 못했어요 — 연결을 확인하고 다시 눌러 주세요`, 'bad');
    else toast('오프라인 음성이 준비됐어요 🎧', 'ok');
  } catch {
    toast('저장 공간이 부족하거나 브라우저가 허용하지 않아요', 'bad');
  }
  dl = null;
  dlNotify();
}

function offlineAudioCard() {
  const box = h('div', { class: 'card' });
  let seq = 0;
  const render = async () => {
    const my = ++seq;
    const total = recordingCount();
    if (!('caches' in window) || !total) {
      box.replaceChildren(h('div', { class: 'bold' }, '📥 오프라인 음성'), h('p', { class: 'small text-2 mt-4' }, total ? '이 브라우저에서는 음성을 따로 보관할 수 없어요.' : '인터넷에 연결되면 내려받을 수 있어요.'));
      return;
    }
    if (dl) {
      const pct = Math.round((dl.done / Math.max(1, dl.total)) * 100);
      box.replaceChildren(
        h('div', { class: 'row between' }, h('div', { class: 'bold' }, '📥 음성 내려받는 중…'), h('span', { class: 'badge brand' }, `${pct}%`)),
        h('div', { class: 'mt-8' }, h('div', { class: 'bar thin' }, h('i', { style: { width: `${pct}%` } }))),
        h('p', { class: 'small text-2 mt-8' }, `${dl.done.toLocaleString('ko-KR')} / ${dl.total.toLocaleString('ko-KR')}개 · 다른 화면으로 가도 계속 받아요`),
        h('button', { class: 'btn btn-outline btn-sm mt-8', type: 'button', onclick: () => { if (dl) dl.stop = true; } }, '멈추기'),
      );
      return;
    }
    const have = await cachedAudioIds();
    if (my !== seq) return; // 그사이 더 새로 그렸으면 그만
    const n = recordingIds().filter((id) => have.has(id)).length;
    const full = n >= total;
    const mb = Math.max(1, Math.round((recordingBytes() * (total - n)) / total / 1048576));
    box.replaceChildren(
      h('div', { class: 'bold' }, full ? '✅ 오프라인 음성 준비 완료' : '📥 오프라인 음성 내려받기'),
      h('p', { class: 'small text-2 mt-4' }, full
        ? `녹음 음성 ${total.toLocaleString('ko-KR')}개를 모두 기기에 보관했어요. 인터넷 없이도 발음을 들을 수 있어요.`
        : `들었던 음성은 자동으로 보관돼요(지금 ${n.toLocaleString('ko-KR')} / ${total.toLocaleString('ko-KR')}개). 지하철·비행기에서도 들으려면 한 번에 모두 받아 두세요.`),
      full
        ? h('button', { class: 'btn btn-ghost btn-sm mt-8', type: 'button', onclick: async () => {
          if (await confirmSheet('기기에 보관한 녹음 음성을 지울까요? 인터넷에 연결되면 다시 들을 수 있어요.', { title: '보관한 음성 지우기', ok: '지우기', danger: true })) {
            await caches.delete(AUDIO_CACHE);
            render();
          }
        } }, '보관한 음성 지우기')
        : h('button', { class: 'btn btn-primary btn-block mt-12', type: 'button', onclick: () => { if (!navigator.onLine) { toast('인터넷에 연결된 뒤 눌러 주세요', 'bad'); return; } downloadAll(); } }, `모두 내려받기 (약 ${mb}MB)`),
    );
  };
  render();
  dlListeners.add(render);
  const offIndex = onVoicesChanged(render); // 녹음 목록을 늦게 받았을 때
  box.cleanup = () => { dlListeners.delete(render); offIndex(); };
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

function installCard() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const body = h('div', { class: 'card' });
  if (standalone) {
    body.append(h('div', { class: 'bold' }, '✅ 앱으로 실행 중이에요'), h('p', { class: 'small text-2 mt-4' }, '한 번 열어 둔 내용은 인터넷 없이도 학습할 수 있어요. 발음 음성까지 모두 쓰려면 위의 "오프라인 음성"을 내려받아 두세요.'));
  } else if (window.__installPrompt) {
    body.append(
      h('div', { class: 'bold' }, '📲 홈 화면에 앱으로 설치'),
      h('p', { class: 'small text-2 mt-4' }, '설치하면 앱처럼 전체 화면으로 열리고, 지하철처럼 인터넷이 약한 곳에서도 학습할 수 있어요.'),
      h('button', { class: 'btn btn-primary btn-block mt-12', type: 'button', onclick: async () => { const p = window.__installPrompt; window.__installPrompt = null; p.prompt(); await p.userChoice.catch(() => {}); } }, '설치하기'),
    );
  } else {
    body.append(
      h('div', { class: 'bold' }, '📲 홈 화면에 추가하기'),
      h('p', { class: 'small text-2 mt-4' }, ios
        ? 'Safari 아래쪽 공유 버튼(⬆️) → "홈 화면에 추가"를 누르세요. 앱처럼 열리고 오프라인에서도 학습할 수 있어요.'
        : '브라우저 메뉴(⋮)에서 "앱 설치" 또는 "홈 화면에 추가"를 누르세요. 앱처럼 열리고 오프라인에서도 학습할 수 있어요.'),
    );
  }
  return body;
}

export default {
  tab: null,
  title: '설정',
  render(root) {
    // 녹음 음성 상태
    const recStatus = h('div', { class: 'f-sub' });
    // 보조: 기기 음성 선택 (녹음이 없는 표현용)
    const voiceSel = h('select', { class: 'select', 'aria-label': '기기 음성 선택' });
    const voiceStatus = h('div', { class: 'f-sub' });
    const renderVoices = () => {
      const n = recordingCount();
      recStatus.textContent = n ? `AI로 미리 녹음한 단어·문장 ${n.toLocaleString('ko-KR')}개 · 회화는 역할마다 남녀 목소리` : '녹음 음성을 불러오는 중이거나 연결이 끊겼어요';
      const vs = trVoices();
      voiceSel.replaceChildren(h('option', { value: '' }, vs.length ? '자동 선택' : '없음'), ...vs.map((v) => h('option', { value: v.voiceURI }, `${v.name}`)));
      voiceSel.value = state.settings.voice || '';
      voiceSel.disabled = !vs.length;
      voiceStatus.textContent = !ttsSupported || !vs.length
        ? '녹음이 없는 표현(문법 활용형 등)은 기기에 튀르키예어 음성이 있을 때만 들려줘요'
        : `녹음이 없는 표현을 읽을 때 써요 · 사용 중: ${currentVoice()?.name || '-'}`;
    };
    voiceSel.addEventListener('change', () => { setVoice(voiceSel.value); setSetting('voice', voiceSel.value); renderVoices(); });
    renderVoices();
    const off = onVoicesChanged(renderVoices);
    const offline = offlineAudioCard();

    // 속도: 저장값 0.9가 자연스러운 속도(1.00×)
    const rateLabel = h('span', { class: 'badge brand' });
    const rate = h('input', { type: 'range', class: 'range', min: '0.6', max: '1.2', step: '0.05', 'aria-label': '말하기 속도' });
    rate.value = String(state.settings.rate);
    const showRate = () => { rateLabel.textContent = `${(Number(rate.value) / 0.9).toFixed(2)}×`; };
    showRate();
    rate.addEventListener('input', showRate);
    rate.addEventListener('change', () => { setSetting('rate', Number(rate.value)); speak(RATE_SAMPLE); });

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
        h('div', { class: 'field' }, h('div', { class: 'f-main' }, h('div', { class: 'f-title' }, '🎧 튀르키예어 발음 음성'), recStatus), speakBtn(VOICE_SAMPLE, { label: '음성 들어 보기' })),
        h('div', { class: 'field', style: { flexWrap: 'wrap' } },
          h('div', { class: 'f-main' }, h('div', { class: 'f-title' }, '말하기 속도 ', rateLabel), h('div', { class: 'f-sub' }, '1.00× = 원어민 보통 속도 · 🐢 버튼은 이 속도의 약 70%')),
          h('div', { style: { width: '100%' } }, rate),
        ),
        field('단어 자동 재생', '새 단어와 카드를 보여줄 때 바로 읽기', sw('autoplay')),
        field('듣기 문제 포함', '레슨에 "듣고 고르기" 문제 넣기', sw('listening')),
        field('효과음', '정답·오답 소리', sw('sfx')),
        field('진동', '지원하는 기기에서만', sw('vibrate')),
      ),
      h('div', { class: 'mt-12' }, offline),
      h('details', { class: 'card flat mt-12' },
        h('summary', { class: 'bold', style: { cursor: 'pointer' } }, '🔈 보조 음성 (기기 음성)'),
        h('div', { class: 'list mt-12' }, h('div', { class: 'field' }, h('div', { class: 'f-main' }, h('div', { class: 'f-title' }, '기기 튀르키예어 음성'), voiceStatus), voiceSel)),
        h('p', { class: 'small text-2 mt-12' }, '문법 드릴의 활용형처럼 녹음이 없는 표현은 기기의 튀르키예어 음성으로 읽어요. 튀르키예어 음성이 없으면 엉터리 발음 대신 소리를 내지 않아요. 설치하려면:'),
        h('div', { class: 'mt-8' }, voiceGuide()),
      ),

      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '표시')),
      h('div', { class: 'list' },
        field('한글 발음 표기', '[메르하바]처럼 표시 — 익숙해지면 꺼 보세요', sw('hangul')),
        field('화면 테마', null, seg('theme', [['auto', '자동'], ['light', '라이트'], ['dark', '다크']])),
      ),

      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '앱 설치·오프라인')),
      installCard(),

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
        h('p', { class: 'small muted mt-8' }, '발음 음성: ', h('a', { href: 'https://huggingface.co/krmkayabasi/Anka-TTS', target: '_blank', rel: 'noopener' }, 'Anka TTS'), '(튀르키예어 음성 모델, Kerem Kayabaşı, CC BY-NC 4.0)로 만든 AI 음성 — 비상업 학습용'),
        h('div', { class: 'row wrap mt-12' },
          h('a', { class: 'btn btn-outline btn-sm', href: '#/stats' }, '학습 통계'),
          h('a', { class: 'btn btn-outline btn-sm', href: REPO, target: '_blank', rel: 'noopener' }, 'GitHub에서 보기'),
        ),
      ),
    );
    return () => { off(); offline.cleanup(); };
  },
};
