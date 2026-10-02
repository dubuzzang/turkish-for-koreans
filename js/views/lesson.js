import { h, confetti } from '../core/ui.js';
import { state, commit, addXP } from '../core/store.js';
import { learnWords, isLearned } from '../core/deck.js';
import { speechAvailable, prefetchSpeech } from '../core/tts.js';
import { sttSupported } from '../core/stt.js';
import { sfxComplete } from '../core/sfx.js';
import { buildLessonSteps } from '../core/lessonBuilder.js';
import { LESSON, LESSONS } from '../data/curriculum.js';
import { runSession, renderDone, fmtDuration } from './session.js';

export const canListen = () => state.settings.listening !== false && speechAvailable();

/** 레슨·연습 단계에서 들려줄 문장 (녹음 파일 미리 받기용) */
export const stepTexts = (steps) => steps.flatMap((s) => [s.w?.tr, s.w?.ex?.[0], s.tr, ...(s.words || []).map((w) => w.tr)]).filter(Boolean);

export default {
  immersive: true,
  tab: 'learn',
  title: (p) => LESSON.get(p[0])?.title || '레슨',
  render(root, [id], { go }) {
    const lesson = LESSON.get(id);
    if (!lesson) { go('#/learn'); return; }
    const prev = state.lessons[id];
    const reviewMode = !!prev?.done;
    const steps = buildLessonSteps(lesson, { listening: canListen(), review: reviewMode, speaking: sttSupported && state.settings.speaking !== false });
    steps.forEach((s) => { if (s.type === 'intro') s.seen = isLearned(s.w.id); });
    prefetchSpeech(stepTexts(steps));

    return runSession(root, {
      steps,
      onExit: () => go('#/learn'),
      onFinish: (sum) => {
        const acc = sum.acc;
        const starN = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
        const firstTime = !prev?.done;
        const xp = 10 + Math.round(acc * 10) + (firstTime ? 5 : 0);
        const wrong = new Set(sum.wrongWords);
        const ratings = Object.fromEntries(lesson.words.map((w) => [w, wrong.has(w) ? 1 : 2]));
        const added = learnWords(lesson.words, ratings);
        state.lessons[id] = {
          done: true,
          stars: Math.max(prev?.stars || 0, starN),
          acc: Math.max(prev?.acc || 0, acc),
          at: Date.now(),
          n: (prev?.n || 0) + 1,
        };
        commit();
        addXP(xp);
        sfxComplete();
        if (starN === 3) confetti();
        const idx = LESSONS.findIndex((l) => l.id === id);
        const nextL = LESSONS[idx + 1];
        renderDone(root, {
          emoji: starN === 3 ? '🏆' : starN === 2 ? '🎉' : '👏',
          title: firstTime ? '레슨 완료!' : '복습 완료!',
          sub: `${lesson.unit.no}단원 · ${lesson.title}${added ? ` — 새 단어 ${added}개가 복습 카드에 추가됐어요` : ''}`,
          starCount: starN,
          stats: [
            { v: `${Math.round(acc * 100)}%`, k: '정확도', cls: 'ok' },
            { v: `+${xp}`, k: 'XP', cls: 'gold' },
            { v: fmtDuration(sum.ms), k: '학습 시간', cls: 'brand' },
          ],
          buttons: [
            nextL ? { label: `다음 레슨: ${nextL.title}`, cls: 'btn-primary', onClick: () => go(`#/lesson/${nextL.id}`) } : null,
            { label: '학습 경로로', cls: nextL ? 'btn-outline' : 'btn-primary', onClick: () => go('#/learn') },
          ].filter(Boolean),
        });
      },
    });
  },
};
