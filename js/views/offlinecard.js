// 오프라인 팩 카드 (설정·앱 설치 화면 공용): 진행 상황 · 내려받기 · 보관본 지우기 · 자동 저장 설정
import { h, toast, confirmSheet } from '../core/ui.js';
import { state, setSetting } from '../core/store.js';
import { onVoicesChanged, AUDIO_CACHE } from '../core/tts.js';
import { offlineStatus, offlineJob, downloadOffline, stopOffline, onOfflineChange, meteredConnection, isStandalone } from '../core/offline.js';

export async function startOffline() {
  if (!navigator.onLine) { toast('인터넷에 연결된 뒤 눌러 주세요', 'bad'); return; }
  const r = await downloadOffline();
  if (r.stopped) toast('내려받기를 멈췄어요. 받은 것은 그대로 남아 있어요');
  else if (r.failed > 0) toast(`${r.failed}개를 받지 못했어요 — 연결을 확인하고 다시 눌러 주세요`, 'bad');
  else if (r.failed < 0) toast('저장 공간이 부족하거나 브라우저가 허용하지 않아요', 'bad');
  else toast('오프라인 준비 완료 — 이제 데이터 없이 학습할 수 있어요 🎉', 'ok');
}

export function offlineCard() {
  const box = h('div', { class: 'card' });
  let seq = 0;
  const render = async () => {
    const my = ++seq;
    if (!('caches' in window)) {
      box.replaceChildren(h('div', { class: 'bold' }, '📥 오프라인 저장'), h('p', { class: 'small text-2 mt-4' }, '이 브라우저에서는 기기에 저장할 수 없어요.'));
      return;
    }
    const job = offlineJob();
    if (job) {
      const pct = job.total ? Math.round((job.done / job.total) * 100) : 0;
      box.replaceChildren(
        h('div', { class: 'row between' }, h('div', { class: 'bold' }, job.done >= job.total && job.total ? '🔤 글꼴 저장 중…' : '📥 오프라인 저장 중…'), h('span', { class: 'badge brand' }, `${pct}%`)),
        h('div', { class: 'mt-8' }, h('div', { class: 'bar thin' }, h('i', { style: { width: `${pct}%` } }))),
        h('p', { class: 'small text-2 mt-8' }, `녹음 ${job.done.toLocaleString('ko-KR')} / ${job.total.toLocaleString('ko-KR')}개 · 다른 화면으로 가도 계속 받아요`),
        h('button', { class: 'btn btn-outline btn-sm mt-8', type: 'button', onclick: stopOffline }, '멈추기'),
      );
      return;
    }
    const st = await offlineStatus();
    if (my !== seq) return; // 그사이 더 새로 그렸으면 그만
    if (!st.total) {
      box.replaceChildren(h('div', { class: 'bold' }, '📥 오프라인 저장'), h('p', { class: 'small text-2 mt-4' }, '인터넷에 연결되면 내려받을 수 있어요.'));
      return;
    }
    const auto = h('input', { type: 'checkbox', role: 'switch', 'aria-label': '앱에서 자동 저장' });
    auto.checked = state.settings.autoOffline !== false;
    auto.addEventListener('change', () => setSetting('autoOffline', auto.checked));
    box.replaceChildren(
      h('div', { class: 'bold' }, st.ready ? '✅ 오프라인 준비 완료' : '📥 오프라인으로 저장하기'),
      h('p', { class: 'small text-2 mt-4' }, st.ready
        ? `녹음 ${st.total.toLocaleString('ko-KR')}개와 글꼴을 모두 기기에 저장했어요. 데이터 없이도 모든 레슨·듣기·회화를 쓸 수 있어요.`
        : `들었던 음성은 자동으로 보관돼요(지금 녹음 ${st.have.toLocaleString('ko-KR')} / ${st.total.toLocaleString('ko-KR')}개). 지하철·비행기에서도 학습하려면 와이파이에서 한 번에 받아 두세요.`),
      st.ready
        ? h('button', { class: 'btn btn-ghost btn-sm mt-8', type: 'button', onclick: async () => {
          if (await confirmSheet('기기에 보관한 녹음 음성을 지울까요? 인터넷에 연결되면 다시 들을 수 있어요.', { title: '보관한 음성 지우기', ok: '지우기', danger: true })) {
            await caches.delete(AUDIO_CACHE);
            render();
          }
        } }, '보관한 음성 지우기')
        : h('div', null,
          meteredConnection() ? h('div', { class: 'note warn mt-8' }, '지금 모바일 데이터(또는 데이터 절약 모드)예요. 와이파이에서 받는 걸 권해요.') : null,
          h('button', { class: 'btn btn-primary btn-block mt-12', type: 'button', onclick: startOffline }, `지금 모두 저장하기 (약 ${st.mbLeft}MB)`)),
      h('div', { class: 'field mt-12', style: { padding: '0' } },
        h('div', { class: 'f-main' }, h('div', { class: 'f-title' }, '앱에서 자동 저장'), h('div', { class: 'f-sub' }, isStandalone() ? '앱을 열 때 와이파이면 새 녹음을 자동으로 받아요' : '홈 화면 앱으로 열면 와이파이에서 자동으로 받아요')),
        h('label', { class: 'switch' }, auto, h('span'))),
    );
  };
  render();
  const off1 = onOfflineChange(render);
  const off2 = onVoicesChanged(render); // 녹음 목록을 늦게 받았을 때
  box.cleanup = () => { off1(); off2(); };
  return box;
}
