"""목소리 프롬프트(voices/f, voices/m) 만들기 — 이미 만든 파일이 저장소에 있으니 다시 만들 때만 쓴다.
  python make_voice.py leyla             # 여성 시작점: FreyaTTS의 Leyla 목소리로 3문장 (FREYATTS_DIR=FreyaTTS 클론 경로)
  python make_voice.py design            # 남성 목소리 디자인 후보 → work/voice/design (고른 클립을 design/best.json에 적는다)
  python make_voice.py cont f            # 여성: Leyla 프롬프트로 이어 말하기 후보 → work/voice/f
  python make_voice.py cont m            # 남성: 고른 디자인 클립으로 이어 말하기 후보 → work/voice/m
  python make_voice.py judge <dir>       # CTC·Whisper·UTMOS·F0 채점 → <dir>/scores.json
  python make_voice.py build <dir> <name> # 상위 3문장을 이어 붙여 voices/<name>.wav + .txt
"""
import json, os, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "work", "voice")
VOICES = os.path.join(HERE, "voices")
os.makedirs(VOICES, exist_ok=True)

PROMPTS = [
    "Merhaba, ben İstanbul'da yaşıyorum ve her sabah vapurla işe gidiyorum.",
    "Bugün hava çok güzel, biraz yürüyüş yapalım mı?",
    "Çay mı içersiniz, yoksa Türk kahvesi mi?",
    "Kitapçıda çok güzel bir şiir kitabı buldum.",
    "Akşam yemeğinde annemle birlikte mercimek çorbası yaptık.",
    "Lütfen biraz daha yavaş konuşur musunuz?",
    "Öğleden sonra müzeyi gezdik, sonra Boğaz'da balık yedik.",
    "Yarın sabah saat dokuzda otogarda buluşalım.",
]
DESIGNS = [
    "A native Turkish man in his thirties, warm and clear baritone voice, standard Istanbul Turkish, natural friendly tone, moderate pace, studio recording",
    "Erkek, otuz yaşlarında, sıcak ve net bir sesle konuşan, İstanbul Türkçesiyle doğal ve sakin konuşan bir Türk",
    "A middle-aged Turkish man, calm deep voice, clear articulation, news-reader style standard Turkish, close-mic studio quality",
]
LEYLA_WAV = os.path.join(HERE, "work", "ref_leyla.wav")
LEYLA_SENTS = ["Kahvaltıda peynir, zeytin ve domates yedik.", "İstanbul'a ne zaman gideceksin?", "Merhaba, nasılsınız?"]
LEYLA_TEXT = " ".join(LEYLA_SENTS)


def cmd_leyla():
    """FreyaTTS-small(Apache-2.0, 튀르키예어 전용)의 기본 목소리 Leyla로 시작점 3문장을 만든다."""
    sys.path.insert(0, os.environ["FREYATTS_DIR"])
    from freyatts import FreyaTTS
    tts = FreyaTTS.from_pretrained("freyavoice/freya-tts", device="cuda")
    gap = np.zeros(int(0.35 * 48000))
    parts = []
    for t in LEYLA_SENTS:
        parts += [tts.synthesize(t), gap]
    os.makedirs(os.path.dirname(LEYLA_WAV), exist_ok=True)
    sf.write(LEYLA_WAV, np.concatenate(parts[:-1]), 48000)


def save(d, name, wav, sr, text, meta):
    os.makedirs(d, exist_ok=True)
    sf.write(os.path.join(d, name + ".wav"), wav, sr)
    meta[name] = text


def cmd_design():
    from voxgen import Vox
    v = Vox()
    d = os.path.join(OUT, "design")
    meta = {}
    for di, desc in enumerate(DESIGNS):
        for seed in range(1, 7):
            for pi in (1, 3):
                save(d, f"d{di}_s{seed}_p{pi}", v.synth(PROMPTS[pi], seed=seed, steps=16, design=desc), v.sr, PROMPTS[pi], meta)
    json.dump(meta, open(os.path.join(d, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def cmd_cont(name):
    from voxgen import Vox
    v = Vox()
    if name == "f":
        v.set_voice("p", LEYLA_WAV, LEYLA_TEXT)
    else:
        src = json.load(open(os.path.join(OUT, "design", "best.json"), encoding="utf-8"))
        v.set_voice("p", src["wav"], src["text"])
    d = os.path.join(OUT, name)
    meta = {}
    for pi, t in enumerate(PROMPTS):
        for seed in range(1, 4):
            save(d, f"p{pi}_s{seed}", v.synth(t, voice="p", seed=seed, steps=16), v.sr, t, meta)
    json.dump(meta, open(os.path.join(d, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def cmd_judge(d):
    from judges import CTC, Whisper, MOS, cer, to16k, f0_median, free
    meta = json.load(open(os.path.join(d, "manifest.json"), encoding="utf-8"))
    names = sorted(meta)
    wavs = {}
    for n in names:
        w, sr = sf.read(os.path.join(d, n + ".wav"))
        wavs[n] = (to16k(w, sr), len(w) / sr)
    x16 = [wavs[n][0] for n in names]
    ctc = CTC(); ch = ctc(x16); free(ctc)
    wh = Whisper(); whh = wh(x16); free(wh)
    mos = MOS(); ms = mos(x16); free(mos)
    rows = {}
    for n, c, w_, m in zip(names, ch, whh, ms):
        rows[n] = {"text": meta[n], "ctc": c, "whisper": w_, "cer_ctc": cer(meta[n], c), "cer_wh": cer(meta[n], w_),
                   "mos": m, "f0": f0_median(wavs[n][0]), "dur": wavs[n][1]}
    json.dump(rows, open(os.path.join(d, "scores.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for n, r in sorted(rows.items(), key=lambda kv: -kv[1]["mos"]):
        print(f"{n:14s} mos {r['mos']:.2f} f0 {r['f0']:5.0f} cer {r['cer_ctc']:.2f}/{r['cer_wh']:.2f} {r['dur']:.1f}s  {r['whisper'][:50]}")


def cmd_build(d, name):
    rows = json.load(open(os.path.join(d, "scores.json"), encoding="utf-8"))
    best = {}
    for n, r in rows.items():
        if r["cer_wh"] > 0 or r["cer_ctc"] > 0.1:
            continue
        if name == "m" and r["f0"] > 165:
            continue
        p = n.split("_")[0]
        if p not in best or r["mos"] > best[p][1]["mos"]:
            best[p] = (n, r)
    top = sorted(best.values(), key=lambda x: -x[1]["mos"])[:3]
    print("pick:", [(n, round(r["mos"], 2), round(r["f0"])) for n, r in top])
    parts, texts, sr = [], [], None
    for n, r in top:
        w, sr = sf.read(os.path.join(d, n + ".wav"))
        parts += [w, np.zeros(int(0.3 * sr))]
        texts.append(r["text"])
    sf.write(os.path.join(VOICES, f"{name}.wav"), np.concatenate(parts[:-1]), sr)
    open(os.path.join(VOICES, f"{name}.txt"), "w", encoding="utf-8").write(" ".join(texts))
    print("wrote", os.path.join(VOICES, f"{name}.wav"))


if __name__ == "__main__":
    c = sys.argv[1]
    if c == "leyla":
        cmd_leyla()
    elif c == "design":
        cmd_design()
    elif c == "cont":
        cmd_cont(sys.argv[2])
    elif c == "judge":
        cmd_judge(sys.argv[2])
    elif c == "build":
        cmd_build(sys.argv[2], sys.argv[3])
