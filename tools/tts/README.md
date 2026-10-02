# 녹음 음성 만들기

앱의 발음 음성(`audio/*.mp3`)은 이 폴더의 스크립트로 미리 만들어 둔 파일입니다.
기기 음성 합성(Web Speech)은 기기마다 품질이 들쭉날쭉하고, 튀르키예어 음성이 없는 기기(예: Windows의 Chrome)에서는
다른 언어 목소리로 읽어 버리기 때문에, 모든 단어·문장을 튀르키예어를 지원하는 신경망 음성 모델로 녹음해 두었습니다.

## 어떻게 만들었나

| 단계 | 내용 |
|---|---|
| 목소리 | 여성(`voices/f`): 튀르키예어 전용 모델 [FreyaTTS-small](https://github.com/freyavoiceai/FreyaTTS)(Apache-2.0)의 기본 목소리 Leyla로 시작 → VoxCPM2로 다시 읽혀 가장 자연스러운 3문장을 고름. 남성(`voices/m`): VoxCPM2 음성 디자인(실존 인물 아님)으로 만든 목소리에서 같은 방법으로 고름 |
| 합성 | [VoxCPM2](https://huggingface.co/openbmb/VoxCPM2)(Apache-2.0) "이어 말하기" — 위 목소리 문장 뒤에 이어서 읽게 해서 목소리와 억양을 일정하게 유지 |
| 검사 | 만든 음성을 두 음성 인식기로 다시 받아써서 원문과 비교: 글자 단위 CTC 인식기(MMS-1b-all, 튀르키예어) + Whisper large-v3-turbo. 틀리면 다른 시드로 다시 만들기(최대 5회). 맞은 후보가 여럿이면 자연스러움 예측 점수(UTMOS)가 높은 것 |
| 마무리 점검 | `qa_voice.py`: 목소리 음높이(F0)가 그 목소리의 평소 범위를 크게 벗어나거나, 말이 지나치게 빠르거나 느리거나, 길이 구간별 UTMOS 하위 4%인 클립을 다시 만들고 — 새 것이 더 나을 때만 교체 |
| 후처리 | 앞뒤 무음 정리, 음량 맞춤(-18 LUFS, 피크 -1.5 dBFS), 24 kHz 모노 MP3 48 kbps |

품질 기록은 `audio-src/qa.json`에 있습니다(`status`: ok · weak(인식기 일부 불일치) · fail(녹음 없음 → 앱은 기기 음성으로 대신)).

참고: 단어 하나만 따로 읽히면 두 모델 모두 끝에 잡음이 붙거나 뭉개지는 일이 많았는데, 목소리 문장에 이어 읽히는 방식에서는
첫 시도 합격률이 96% 정도로 올라갔습니다(전체 4,267개 중 1회차 4,087개). 자연스러움 예측 점수(UTMOS)도 이 방식이 가장 높았습니다.
모음 글자 `ı` 하나처럼 혼자서는 소리가 뭉개지는 글은 `scripts/audio.mjs`의 `SAY_OVERRIDE`로 자연스러운 표현("ı harfi")으로 읽힙니다.

## 다시 만들기

```bash
# 1) 앱에서 소리 나는 글 목록 (데이터를 고친 뒤마다)
node scripts/audio.mjs texts

# 2) 새로 생긴 글만 합성 (GPU 권장, 이미 있는 MP3는 건너뜀)
python -m venv .venv && .venv/Scripts/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
.venv/Scripts/pip install -r tools/tts/requirements.txt
.venv/Scripts/python tools/tts/gen_audio.py

# 3) 마무리 점검: 튀는 클립을 찾아 다시 만들기 (새 것이 더 나을 때만 교체)
.venv/Scripts/python tools/tts/qa_voice.py
.venv/Scripts/python tools/tts/gen_audio.py --redo tools/tts/work/redo.txt --retry-weak --max-tries 4 --steps 16
.venv/Scripts/python tools/tts/fix_pitch.py   # 음높이가 튀는 클립은 범위 안 후보로

# 4) 앱이 읽는 목록 갱신 + 서비스 워커
node scripts/audio.mjs index
npm run build:sw
```

- 같은 글·같은 목소리면 파일 이름(`audio/<id>.mp3`)이 같아서, 바뀐 글만 새로 만들어집니다.
- `--retry-weak`: weak·fail로 기록된 글을 다른 시드로 다시 만들어 봅니다.
- `make_voice.py`: 목소리 프롬프트를 처음부터 다시 만들 때만 씁니다(사용법은 파일 머리말).
