// 녹음 음성 관리
//   node scripts/audio.mjs texts  → audio-src/texts.json (앱에서 소리 나는 모든 튀르키예어 문장)
//   node scripts/audio.mjs index  → audio/index.json (실제로 있는 음성 파일 목록, 앱이 읽는다)
// 음성 합성은 tools/tts의 Python 스크립트가 texts.json을 읽어 audio/<id>.mp3를 만든다.
import { writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { audioKey, audioId } from '../js/core/audiokey.js';
import { WORDS } from '../js/data/vocab.js';
import { LESSONS } from '../js/data/curriculum.js';
import { NOTES } from '../js/data/notes.js';
import { DIALOGUES } from '../js/data/dialogues.js';
import { ALL_PHRASES } from '../js/data/phrases.js';
import { DAILY } from '../js/data/daily.js';
import { LETTERS, PAIRS } from '../js/data/alphabet.js';
import { GREETINGS, HELLO, VOICE_SAMPLE, RATE_SAMPLE } from '../js/data/speech.js';
import { numberTr, priceTr, timeTr, timeAtTr, timeDigitalTr, NUM_SETS, CLOCK_TIMES } from '../js/core/numbers.js';
import { tokenize } from '../js/core/tr.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const AUDIO_DIR = join(ROOT, 'audio');
const SRC_DIR = join(ROOT, 'audio-src');

// ---------- 화면과 같은 방식으로 읽을 문장을 만든다 ----------
/** HTML 안의 class="tr" 요소 글자 (tapToSpeak와 같은 결과) */
export function trSpans(html) {
  const out = [];
  const re = /<(span|b)\s+class="tr">/g;
  let m;
  while ((m = re.exec(String(html || '')))) {
    const tag = m[1];
    let depth = 1, i = re.lastIndex;
    const open = new RegExp(`<${tag}\\b`, 'g'), close = new RegExp(`</${tag}>`, 'g');
    while (depth > 0) {
      open.lastIndex = close.lastIndex = i;
      const o = open.exec(html), c = close.exec(html);
      if (!c) break;
      if (o && o.index < c.index) { depth++; i = o.index + 1; } else { depth--; i = c.index + c[0].length; }
    }
    const inner = html.slice(re.lastIndex, i - `</${tag}>`.length);
    const text = inner.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[()]/g, '').trim();
    if (text) out.push(text);
  }
  return out;
}

/** 레슨 '문법 확인' 문제의 정답 문장 (exercises.js renderChoice와 같은 규칙) */
export function choiceAnswer(it) {
  const parts = String(it.q).split('___');
  const answerText = parts.length > 1 ? parts.join(it.opts[it.a]).replace(/\s+([.?!,])/g, '$1') : it.opts[it.a];
  return /[a-zçğıöşü]/i.test(answerText) && !/[가-힣]/.test(answerText) ? answerText : null;
}

export const phraseSay = (tr) => tr.replace(/…/g, '').replace(/\s*\/\s*/g, ', ');

const upperFirst = (s) => s.replace(/^(["'(«“]*)(\S)/, (_, q, c) => q + (c === 'i' ? 'İ' : c === 'ı' ? 'I' : c.toUpperCase()));
const LETTER_NAME = Object.fromEntries(LETTERS.map((L) => [L.up, L.say]));

// 혼자서는 합성기가 제대로 못 읽는 아주 짧은 글 → 자연스러운 튀르키예어 표현으로 (키: audioKey)
const SAY_OVERRIDE = {
  ı: 'ı harfi.', // 모음 ı 한 글자는 소리가 뭉개져서 "ı 글자"라고 읽힌다
};

/** 합성기에 넣을 글: 숫자는 글자로, 기호 정리, 문장 끝 부호 (override=false: 짧은 글 대체 없이 — 구글 음성용) */
export function ttsText(text, { override = true } = {}) {
  const over = override && SAY_OVERRIDE[audioKey(text)];
  if (over) return over;
  let s = String(text).normalize('NFC')
    .replace(/[“”"«»]/g, '')
    .replace(/[()[\]]/g, '')
    .replace(/\bwi-?fi\b/gi, 'vay fay')
    .replace(/\s*[→⇒]\s*/g, ', ')
    .replace(/([a-zçğıöşüâîû])-(?=[a-zçğıöşüâîû])/gi, '$1')
    .replace(/(^|[\s,/])-+(?=[a-zçğıöşüâîû])/gi, '$1')
    .replace(/\b([A-ZÇĞİÖŞÜ])(\d+)\b/g, (_, L, d) => `${LETTER_NAME[L] || L} ${numberTr(+d)}`)
    .replace(/(\d{1,2}):(\d{2})/g, (_, hh, mm) => timeDigitalTr(+hh, +mm))
    .replace(/\d{1,3}(?:\.\d{3})+(?!\d)/g, (d) => numberTr(Number(d.replace(/\./g, '')))) // 1.500 = bin beş yüz
    .replace(/(\d+),(\d+)/g, (_, a, b) => `${numberTr(+a)} virgül ${numberTr(+b)}`) // 3,5 = üç virgül beş
    .replace(/\d+/g, (d) => numberTr(Number(d)))
    .replace(/\s*…\s*/g, ', ')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+[—–-]\s+/g, ', ')
    .replace(/\s*,(?:\s*,)+/g, ',') // "…" 자리 때문에 생긴 쉼표 겹침 → 군소리 방지
    .replace(/\s+([,.?!])/g, '$1')
    .replace(/,(?=\S)/g, ', ')
    .replace(/^[-–—\s,]+/, '')
    .replace(/[\s,;:]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!/[.?!]$/.test(s)) s += '.';
  // 글자 하나(알파벳 모음 등)는 대문자로 쓰면 영어 'I'처럼 읽기 쉬워 소문자 그대로
  return /^[a-zçğıöşü]\.$/.test(s) ? s : upperFirst(s);
}

export function collectTexts() {
  const items = new Map();
  const add = (text, src, voice = 'f') => {
    if (!text || !audioKey(text)) return;
    const id = audioId(text, voice);
    const cur = items.get(id);
    if (cur) { if (!cur.src.includes(src)) cur.src.push(src); return; }
    items.set(id, { id, voice, key: audioKey(text), text: String(text), say: ttsText(text), google: ttsText(text, { override: false }), src: [src] });
  };
  const sentenceTokens = [];

  for (const w of WORDS) {
    add(w.tr, 'word');
    if (w.ex) add(w.ex[0], 'example');
  }
  for (const l of LESSONS) {
    for (const [tr] of l.sents || []) { add(tr, 'sentence'); sentenceTokens.push(tr); }
    for (const it of l.items || []) add(choiceAnswer(it), 'choice');
    for (const t of trSpans(l.tip?.html)) add(t, 'tip');
  }
  for (const n of NOTES) {
    for (const s of n.sections) {
      for (const html of [s.p, s.tip, s.warn, ...(s.table ? [...s.table.head, ...s.table.rows.flat()] : [])]) {
        for (const t of trSpans(html)) add(t, 'note');
      }
      for (const [tr] of s.ex || []) add(tr, 'note');
    }
  }
  for (const d of DIALOGUES) {
    for (const [role, tr] of d.lines) { add(tr, 'dialogue', d.roles[role].voice); sentenceTokens.push(tr); }
    for (const [tr] of d.keys) add(tr.replace(/…/g, ''), 'key');
  }
  for (const p of ALL_PHRASES) add(phraseSay(p.tr), 'phrase');
  for (const [tr] of DAILY) add(tr, 'daily');
  for (const L of LETTERS) {
    add(L.say, 'letter');
    for (const [tr] of L.ex) add(tr, 'letter');
  }
  for (const g of PAIRS) for (const [a, , b] of g.pairs) { add(a, 'pair'); add(b, 'pair'); }
  for (const [, tr] of GREETINGS) add(tr, 'fixed');
  for (const t of [HELLO, VOICE_SAMPLE, RATE_SAMPLE]) add(t, 'fixed');
  for (const r of [1, 2, 3, 4]) for (const n of NUM_SETS[r]) add(numberTr(n), 'number');
  for (const n of NUM_SETS[5]) add(priceTr(n), 'number');
  for (const [h, m] of CLOCK_TIMES) { add(timeTr(h, m), 'time'); add(timeAtTr(h, m), 'time'); }
  // 문장 조립 타일: 단어를 누르면 그 단어를 읽어 준다
  for (const s of sentenceTokens) for (const t of tokenize(s)) add(t, 'tile');
  return [...items.values()];
}

function writeTexts() {
  const items = collectTexts();
  mkdirSync(SRC_DIR, { recursive: true });
  writeFileSync(join(SRC_DIR, 'texts.json'), `${JSON.stringify({ count: items.length, items }, null, 1)}\n`);
  const by = {};
  for (const it of items) by[it.src[0]] = (by[it.src[0]] || 0) + 1;
  console.log(`문장 ${items.length}개 → audio-src/texts.json`, by);
}

export function buildIndex() {
  const items = collectTexts();
  const have = new Set(existsSync(AUDIO_DIR) ? readdirSync(AUDIO_DIR).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)) : []);
  const ids = items.map((it) => it.id).filter((id) => have.has(id)).sort();
  return { ids, missing: items.filter((it) => !have.has(it.id)), orphans: [...have].filter((id) => !items.some((it) => it.id === id)) };
}

function writeIndex() {
  const { ids, missing, orphans } = buildIndex();
  const bytes = ids.reduce((s, id) => s + statSync(join(AUDIO_DIR, `${id}.mp3`)).size, 0);
  writeFileSync(join(AUDIO_DIR, 'index.json'), `${JSON.stringify({ v: 1, bytes, ids })}\n`);
  console.log(`audio/index.json: 음성 ${ids.length}개 (${(bytes / 1048576).toFixed(1)}MB) · 아직 없음 ${missing.length}개 · 쓰지 않는 파일 ${orphans.length}개`);
  if (missing.length) console.log('  없음 예:', missing.slice(0, 8).map((m) => m.text).join(' | '));
  if (orphans.length) console.log('  쓰지 않는 파일:', orphans.slice(0, 8).join(' '));
}

if (process.argv[1] && process.argv[1].endsWith('audio.mjs')) {
  const cmd = process.argv[2];
  if (cmd === 'texts') writeTexts();
  else if (cmd === 'index') writeIndex();
  else console.log('사용: node scripts/audio.mjs texts | index');
}
