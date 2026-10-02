"""Anka-TTS(튀르키예어로 미세조정한 F5-TTS)로 문장 목록을 WAV로 만든다 — 별도 가상환경에서 실행.
  python anka_synth.py <jobs.json> <출력 폴더>
jobs.json: [{"name": 파일 이름, "text": 문장, "voice": "f"|"m", "seed": 정수, "speed": 실수(선택)}]
"""
import json, os, sys, time
import soundfile as sf

VOICE = {"f": "female", "m": "male"}


def main():
    jobs = json.load(open(sys.argv[1], encoding="utf-8"))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    from anka import AnkaTTS
    tts = AnkaTTS.from_pretrained("anka-tts/v0.1", device="cuda", progress=False)
    t0, made = time.time(), 0
    for j in jobs:
        p = os.path.join(out, j["name"] + ".wav")
        if os.path.exists(p):
            continue
        wav = tts.synthesize(j["text"], voice=VOICE[j["voice"]], seed=int(j.get("seed", 0)), speed=j.get("speed"), progress=False)
        sf.write(p + ".part", wav, 24000, subtype="PCM_16", format="WAV")
        os.replace(p + ".part", p)
        made += 1
        if made % 50 == 0:
            el = time.time() - t0
            print(f"{time.strftime('%H:%M:%S')}   Anka 합성 {made}/{len(jobs)} · {el / made:.2f}s/개", flush=True)
    print(f"Anka 합성 완료 {made}개 · {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
