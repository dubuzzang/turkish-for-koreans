// 단어 데이터 파서 · 색인
import { RAW1 } from './vocab-1.js';
import { RAW2 } from './vocab-2.js';
import { RAW3 } from './vocab-3.js';
import { RAW4 } from './vocab-4.js';
import { RAW5 } from './vocab-5.js';
import { trLower, fold } from '../core/tr.js';

export const CATS = [
  { id: 'greet', ko: '인사·기본 표현', emoji: '👋' },
  { id: 'people', ko: '사람·가족', emoji: '👨‍👩‍👧' },
  { id: 'jobs', ko: '직업', emoji: '💼' },
  { id: 'countries', ko: '나라·언어', emoji: '🌏' },
  { id: 'numbers', ko: '숫자', emoji: '🔢' },
  { id: 'time', ko: '시간·날짜', emoji: '🗓️' },
  { id: 'food', ko: '음식', emoji: '🥙' },
  { id: 'drinks', ko: '음료', emoji: '🫖' },
  { id: 'taste', ko: '식당·맛', emoji: '🍽️' },
  { id: 'home', ko: '집·물건', emoji: '🏠' },
  { id: 'city', ko: '도시·장소', emoji: '🕌' },
  { id: 'transport', ko: '교통·여행', emoji: '🚋' },
  { id: 'body', ko: '몸·건강', emoji: '🩺' },
  { id: 'clothes', ko: '옷·쇼핑', emoji: '🛍️' },
  { id: 'colors', ko: '색깔', emoji: '🎨' },
  { id: 'nature', ko: '자연·날씨', emoji: '⛅' },
  { id: 'animals', ko: '동물', emoji: '🐈' },
  { id: 'adjectives', ko: '형용사', emoji: '✨' },
  { id: 'verbs', ko: '동사', emoji: '🏃' },
  { id: 'adverbs', ko: '부사·접속사', emoji: '🔗' },
  { id: 'pronouns', ko: '대명사·의문사', emoji: '❓' },
  { id: 'post', ko: '후치사·위치', emoji: '📍' },
  { id: 'school', ko: '학교·일', emoji: '📚' },
  { id: 'hobbies', ko: '취미·여가', emoji: '⚽' },
  { id: 'emotions', ko: '감정', emoji: '💗' },
];

const RAW = { ...RAW1, ...RAW2, ...RAW3, ...RAW4, ...RAW5 };

export const idOf = (tr) => fold(trLower(tr)).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

function parseFlags(str) {
  const f = { tags: new Set() };
  for (const tok of (str || '').split(/\s+/).filter(Boolean)) {
    const [k, v] = tok.split('=');
    if (v !== undefined) f[k] = v;
    else f.tags.add(k);
  }
  return f;
}

export const WORDS = [];
export const WORD = new Map();

for (const cat of CATS) {
  const block = RAW[cat.id];
  if (!block) continue;
  block.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).forEach((line) => {
    const [tr, ko, pos, exTr, exKo, flagStr, note] = line.split(' | ').map((s) => (s ?? '').trim());
    const flags = parseFlags(flagStr);
    const w = {
      id: flags.id || idOf(tr),
      tr,
      ko,
      pos: pos || 'n',
      cat: cat.id,
      ex: exTr ? [exTr, exKo] : null,
      note: note || '',
      alt: flags.alt ? flags.alt.split('/') : [],
      soft: flags.tags.has('soft') ? true : flags.tags.has('hard') ? false : undefined,
      drop: flags.tags.has('drop'),
      front: flags.tags.has('front'),
      proper: flags.tags.has('proper'),
      nodrill: flags.tags.has('nodrill'),
    };
    WORDS.push(w);
    WORD.set(w.id, w);
  });
}

export const wordsByCat = (catId) => WORDS.filter((w) => w.cat === catId);
export const catOf = (id) => CATS.find((c) => c.id === id);
/** 뜻 표시용: 첫 번째 뜻만 (선택지 등) */
export const shortKo = (w) => w.ko.split(/[;,]/)[0].replace(/\(.*?\)/g, '').trim();
