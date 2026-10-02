# 녹음 음성 만들기

앱의 발음 음성(`audio/*.mp3`)은 이 폴더의 스크립트로 미리 만들어 둔 파일입니다.
기기 음성 합성(Web Speech)은 기기마다 품질이 들쭉날쭉하고, 튀르키예어 음성이 없는 기기(예: Windows의 Chrome)에서는
다른 언어 목소리로 읽어 버리기 때문에, 모든 단어·문장을 튀르키예어 음성 모델로 녹음해 두었습니다.

## 지금 쓰는 엔진: Anka TTS

[Anka TTS](https://huggingface.co/krmkayabasi/Anka-TTS) — F5-TTS를 튀르키예어 음성 데이터로 미세조정한 모델(Kerem Kayabaşı).
내장 여성·남성 목소리는 AI로 만든 목소리이고 실존 인물의 녹음·복제가 아닙니다.
**가중치와 목소리는 CC BY-NC 4.0(비상업)** — 무료 학습 앱이라 쓸 수 있고, 출처를 앱(설정 → 정보)과 README에 표기했습니다.
상업적으로 쓰려면 다른 엔진으로 다시 만들거나 저작자에게 허락을 받아야 합니다.

### 엔진을 고른 근거 (`compare_engines.py`, 같은 문장 100개 · 같은 후처리)

| 엔진 | 인식 일치 | 발음 일치도(nll↓) | 튀르키예어로 판별 | UTMOS(자연스러움) |
|---|---|---|---|---|
| VoxCPM2 이어 말하기 (v1.5.0) | 97/100 | 1.51 | 99.9% | 2.92 |
| **Anka TTS** | 94/100 → 재시도로 보완 | 1.62 | 99.9% | **3.67** |
| FreyaTTS-small | 46/100 | 2.69 | 98.3% | 2.69 |

v1.5.0의 녹음은 기계 판별로는 튀르키예어였지만 "한글을 읽는 것 같다"는 사용자 의견이 있었고,
자연스러움 점수에서 Anka가 크게 앞섰습니다(단어 하나짜리 2.72 → 3.60, 예문 2.90 → 3.88).

## 만드는 과정

| 단계 | 내용 |
|---|---|
| 글 목록 | `node scripts/audio.mjs texts` → `audio-src/texts.json` (화면과 똑같은 규칙으로 소리 나는 모든 글, 숫자는 글자로) |
| 합성 | `anka_synth.py`(Anka 전용 가상환경)를 GPU에서 여러 개 나란히 실행, 권장값(speed 0.85 · nfe 32 · cfg 2.0) |
| 검사 | 두 음성 인식기로 다시 받아써서 원문과 비교: 글자 단위 CTC(MMS-1b-all, 튀르키예어) + Whisper large-v3-turbo. 틀리면 다른 시드로 다시 만들기(최대 5회). 맞은 후보가 여럿이면 UTMOS가 높은 것 |
| 마무리 점검 | `qa_voice.py`: 음높이가 튀거나, 지나치게 빠르거나 느리거나, 길이 구간별 UTMOS 하위 4%인 클립을 다시 만들고 — 새 것이 더 나을 때만 교체 |
| 후처리 | 앞뒤 무음 정리, 음량 맞춤(-18 LUFS, 피크 -1.5 dBFS), 24 kHz 모노 MP3 48 kbps |

품질 기록은 `audio-src/qa.json`에 있습니다(`status`: ok · weak(인식기 일부 불일치) · fail(녹음 없음 → 앱은 기기 음성으로 대신)).

## 다시 만들기

```bash
# 1) 앱에서 소리 나는 글 목록 (데이터를 고친 뒤마다)
node scripts/audio.mjs texts

# 2) 가상환경 두 개 (Anka는 따로)
python -m venv .venv && .venv/Scripts/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
.venv/Scripts/pip install -r tools/tts/requirements.txt
python -m venv .venv-anka && .venv-anka/Scripts/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
.venv-anka/Scripts/pip install "anka-tts[tts]"

# 3) 새로 생긴 글만 합성·검사 (이미 있는 MP3는 건너뜀)
set ANKA_PY=.venv-anka/Scripts/python.exe
.venv/Scripts/python tools/tts/gen_audio.py --engine anka --jobs 3

# 4) 마무리 점검 → 튀는 클립 다시 만들기 (새 것이 더 나을 때만 교체)
.venv/Scripts/python tools/tts/qa_voice.py
.venv/Scripts/python tools/tts/gen_audio.py --engine anka --redo tools/tts/work/redo.txt --retry-weak --max-tries 4

# 5) 앱이 읽는 목록 갱신 + 서비스 워커
node scripts/audio.mjs index
npm run build:sw
```

- 같은 글·같은 목소리면 파일 이름(`audio/<id>.mp3`)이 같아서, 바뀐 글만 새로 만들어집니다.
- 녹음을 통째로 다시 만들 때는 `js/core/audiokey.js`의 `AUDIO_REV`와 `js/core/tts.js`·`scripts/gen-sw.mjs`의 보관함 이름을 함께 올려, 기기에 보관된 예전 녹음이 섞이지 않게 합니다.
- `gen_audio.py --engine vox`: v1.5.0에서 쓴 VoxCPM2 방식(`voices/f`, `voices/m` 프롬프트, `make_voice.py`로 만듦).
- `gen_google.py`: Google Cloud Text-to-Speech로 만들 때(API 키 필요, 무료 사용량 안).
