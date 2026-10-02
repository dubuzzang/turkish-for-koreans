// 앱 설치 · 오프라인: 안드로이드 앱(APK)·아이폰 홈 화면 앱 설치 안내, 오프라인 팩, 학습 기록 옮기기
import { h, icon, toast } from '../core/ui.js';
import { isStandalone, platform, inAppBrowser } from '../core/offline.js';
import { packRecords, unpackRecords, moveLink, APP_ORIGIN } from '../core/transfer.js';
import { offlineCard } from './offlinecard.js';

export const APK_URL = `${APP_ORIGIN}/download/merhaba.apk`;
const onAppOrigin = () => location.origin === APP_ORIGIN;
const steps = (...items) => h('ol', { class: 'steps' }, items.map((t) => h('li', null, t)));

function inAppCard(kind) {
  const url = onAppOrigin() ? location.href.split('#')[0] : `${APP_ORIGIN}/`;
  const os = platform();
  const open = kind === 'kakao'
    ? `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`
    : os === 'android' ? `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end` : null;
  return h('div', { class: 'note warn' },
    h('div', { class: 'note-title' }, '⚠️ 앱 안 브라우저에서는 설치할 수 없어요'),
    kind === 'kakao' ? '카카오톡 안에서 열렸어요. ' : '다른 앱 안에서 열렸어요. ',
    os === 'ios' ? 'Safari로 열어야 홈 화면에 추가할 수 있어요.' : 'Chrome으로 열어야 앱을 설치할 수 있어요.',
    open
      ? h('a', { class: 'btn btn-primary btn-block mt-12', href: open }, os === 'ios' ? 'Safari로 열기' : 'Chrome으로 열기')
      : h('div', { class: 'mt-8 small' }, '오른쪽 아래(또는 위) ⋯ 메뉴 → "Safari로 열기" / "다른 브라우저로 열기"를 누르세요.'),
  );
}

function androidCard(primary) {
  const prompt = window.__installPrompt;
  return h('div', { class: `card ${primary ? '' : 'flat'}` },
    h('div', { class: 'bold', style: { fontSize: '17px' } }, '🤖 안드로이드'),
    h('a', { class: 'btn btn-primary btn-block btn-lg mt-12', href: APK_URL, download: 'merhaba.apk' }, icon('download', 20), 'Merhaba 앱 내려받기 (APK)'),
    steps(
      '위 버튼으로 내려받아요 (2MB 정도).',
      '다 받으면 알림이나 "다운로드"에서 merhaba.apk를 눌러 열어요.',
      '"출처를 알 수 없는 앱 설치"를 허용하고 설치해요. Play 프로텍트 안내가 나오면 "무시하고 설치"를 눌러요(구글 플레이에 올리지 않은 앱이라서 나와요).',
      '앱을 처음 열면 와이파이에서 녹음·글꼴을 자동으로 저장해요(약 30MB). 그다음부터는 데이터 없이 학습할 수 있어요.',
    ),
    prompt
      ? h('button', { class: 'btn btn-outline btn-block mt-8', type: 'button', onclick: async () => { window.__installPrompt = null; prompt.prompt(); await prompt.userChoice.catch(() => {}); } }, '또는 Chrome으로 바로 설치')
      : h('p', { class: 'small muted mt-8' }, '또는 Chrome 메뉴(⋮) → "앱 설치" / "홈 화면에 추가"로도 설치할 수 있어요.'),
  );
}

function iosCard(primary) {
  return h('div', { class: `card ${primary ? '' : 'flat'}` },
    h('div', { class: 'bold', style: { fontSize: '17px' } }, '🍎 아이폰 · 아이패드'),
    steps(
      h('span', null, h('b', null, 'Safari'), '로 ', onAppOrigin() ? '이 페이지를' : h('a', { href: `${APP_ORIGIN}/#/install` }, APP_ORIGIN.replace('https://', '')), ' 열어요.'),
      h('span', null, '아래쪽 ', h('b', null, '공유 버튼(⬆️)'), '을 눌러요.'),
      h('span', null, h('b', null, '"홈 화면에 추가"'), ' → 추가를 눌러요.'),
      '홈 화면의 Merhaba 아이콘으로 열면 와이파이에서 녹음·글꼴을 자동으로 저장해요(약 30MB). 그다음부터는 데이터 없이 학습할 수 있어요.',
    ),
    h('p', { class: 'small muted mt-8' }, '앱 스토어용 앱은 애플 개발자 등록이 필요해서, 지금은 홈 화면 앱으로 제공해요. 기능은 같아요.'),
  );
}

function desktopCard() {
  const prompt = window.__installPrompt;
  return h('div', { class: 'card flat' },
    h('div', { class: 'bold', style: { fontSize: '17px' } }, '💻 PC'),
    prompt
      ? h('button', { class: 'btn btn-outline btn-block mt-12', type: 'button', onclick: async () => { window.__installPrompt = null; prompt.prompt(); await prompt.userChoice.catch(() => {}); } }, '이 PC에 앱으로 설치')
      : h('p', { class: 'small text-2 mt-8' }, 'Chrome·Edge 주소창 오른쪽의 설치 아이콘(⊕) 또는 메뉴 → "앱 설치"를 누르세요.'),
  );
}

function moveCard() {
  const area = h('textarea', { class: 'type-input', rows: 3, placeholder: '다른 곳에서 복사한 기록 코드를 붙여넣으세요', 'aria-label': '기록 코드', style: { fontSize: '14px' } });
  return h('div', { class: 'card' },
    h('div', { class: 'bold' }, '📦 학습 기록 옮기기'),
    h('p', { class: 'small text-2 mt-4' }, '기록은 주소·앱마다 따로 저장돼요. 브라우저에서 쓰던 기록을 설치한 앱으로(또는 반대로) 옮길 수 있어요.'),
    h('div', { class: 'row wrap mt-12' },
      h('button', { class: 'btn btn-soft btn-sm', type: 'button', onclick: async () => {
        try {
          await navigator.clipboard.writeText(await packRecords());
          toast('기록 코드를 복사했어요 — 앱의 이 화면에서 붙여넣으세요', 'ok');
        } catch { toast('복사하지 못했어요. 설정 → 백업 내보내기를 써 주세요', 'bad'); }
      } }, '내 기록 코드 복사'),
      platform() !== 'ios' && !isStandalone()
        ? h('button', { class: 'btn btn-outline btn-sm', type: 'button', onclick: async () => { location.href = moveLink(await packRecords()); } }, '앱으로 기록 보내기')
        : null,
    ),
    h('div', { class: 'mt-12' }, area),
    h('button', { class: 'btn btn-outline btn-block mt-8', type: 'button', onclick: async () => {
      try {
        await unpackRecords(area.value);
        toast('기록을 가져왔어요', 'ok');
        setTimeout(() => { location.hash = '#/home'; location.reload(); }, 500);
      } catch (e) { toast(e.message || '가져오지 못했어요', 'bad'); }
    } }, '붙여넣은 기록 가져오기'),
    h('p', { class: 'small muted mt-8' }, '가져오면 이 앱의 지금 기록은 바뀌어요.'),
  );
}

export default {
  tab: null,
  title: '앱 설치 · 오프라인',
  render(root) {
    const os = platform();
    const inApp = inAppBrowser();
    const standalone = isStandalone();
    const offline = offlineCard();
    const cards = os === 'ios' ? [iosCard(true), androidCard(false), desktopCard()]
      : os === 'android' ? [androidCard(true), iosCard(false), desktopCard()]
        : [desktopCard(), androidCard(false), iosCard(false)];
    root.append(...[
      h('div', { class: 'page-head' },
        h('a', { class: 'small', href: '#/settings' }, '← 설정'),
        h('h1', { class: 'mt-4' }, '📲 앱 설치 · 오프라인'),
        h('p', null, '설치하면 앱처럼 열리고, 녹음 음성과 글꼴까지 기기에 저장돼서 인터넷(데이터) 없이도 학습할 수 있어요.'),
      ),
      inApp && inAppCard(inApp),
      !onAppOrigin() && h('div', { class: 'note ko' }, h('div', { class: 'note-title' }, '🔗 앱 주소'), '설치용 정식 주소는 ', h('a', { href: `${APP_ORIGIN}/#/install` }, APP_ORIGIN.replace('https://', '')), '예요. 여기서 쓰던 기록은 아래 "학습 기록 옮기기"로 옮길 수 있어요.'),
      standalone && h('div', { class: 'card' }, h('div', { class: 'bold' }, '✅ 앱으로 실행 중이에요'), h('p', { class: 'small text-2 mt-4' }, '아래 오프라인 저장이 끝나면 데이터 없이 학습할 수 있어요.')),
      h('div', { class: 'section-head mt-16' }, h('div', { class: 'section-title' }, '오프라인 저장')),
      offline,
      !standalone && h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '설치하기')),
      ...(standalone ? [] : cards.map((c) => h('div', { class: 'mt-12' }, c))),
      h('div', { class: 'section-head mt-24' }, h('div', { class: 'section-title' }, '기록')),
      moveCard(),
    ].filter(Boolean));
    return () => offline.cleanup();
  },
};
