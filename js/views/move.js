// 기록 가져오기: #/move/<옮기기 코드> 링크로 열렸을 때 (다른 주소·브라우저에서 보낸 학습 기록)
import { h, toast } from '../core/ui.js';
import { unpackRecords } from '../core/transfer.js';

const clearUrl = () => history.replaceState(null, '', `${location.pathname}${location.search}#/home`);

export default {
  tab: null,
  title: '기록 가져오기',
  render(root, [code], { go }) {
    if (!code) { go('#/install'); return null; }
    root.append(
      h('div', { class: 'page-head' }, h('h1', null, '📦 학습 기록 가져오기')),
      h('div', { class: 'card' },
        h('p', { class: 'text-2' }, '다른 곳에서 보낸 학습 기록이에요. 가져오면 여기의 지금 기록(레슨 진행·복습 카드·XP)은 보낸 기록으로 바뀌어요.'),
        h('div', { class: 'grid-2 mt-16' },
          h('button', { class: 'btn btn-outline btn-lg', type: 'button', onclick: () => { clearUrl(); location.reload(); } }, '취소'),
          h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: async () => {
            try {
              await unpackRecords(code);
              toast('기록을 가져왔어요', 'ok');
              clearUrl();
              setTimeout(() => location.reload(), 500);
            } catch (e) { toast(e.message || '가져오지 못했어요', 'bad'); }
          } }, '가져오기'),
        ),
      ),
    );
    return null;
  },
};
