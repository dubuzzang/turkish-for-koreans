"""음성 엔진 비교: 같은 문장 표본을 여러 엔진으로 만들어 원어민다움을 객관 지표로 잰다.
  python compare_engines.py [--n 1]   # 결과: work/compare/report.json + 표 출력
지표
- 인식 일치: CTC·Whisper 중 하나라도 원문과 같으면 일치
- 발음 일치도(nll): 튀르키예어 음향모델(MMS)이 원문을 그 소리로 읽었다고 볼 확률의 음의 로그(글자당, 낮을수록 원어민 발음에 가까움)
- 언어 판별: Whisper가 듣기에 튀르키예어일 확률 P(tr), 한국어일 확률 P(ko) — 3단어 이상 문장만
- UTMOS: 자연스러움 예측 점수
엔진: vox(현재 VoxCPM2 녹음) · anka(Anka-TTS, 튀르키예어 미세조정 F5-TTS) · freya(FreyaTTS-small)
"""
import argparse, json, os, subprocess, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(HERE, "work", "compare")
ANKA_PY = os.environ.get("ANKA_PY", r"C:\Users\jeong\tts-tools\venv-anka\Scripts\python.exe")
FREYA_DIR = os.environ.get("FREYATTS_DIR", r"C:\Users\jeong\tts-tools\FreyaTTS")
PLAN = {"word": 25, "tile": 15, "example": 20, "sentence": 10, "dialogue": 12, "phrase": 6, "letter": 6, "number": 6}


def sample():
    items = json.load(open(os.path.join(REPO, "audio-src", "texts.json"), encoding="utf-8"))["items"]
    rng = np.random.default_rng(7)
    picked = []
    for src, n in PLAN.items():
        pool = [it for it in items if it["src"][0] == src]
        if src == "dialogue":  # 남녀 절반씩
            m = [it for it in pool if it["voice"] == "m"]
            f = [it for it in pool if it["voice"] == "f"]
            picked += [m[i] for i in rng.choice(len(m), n // 2, replace=False)] + [f[i] for i in rng.choice(len(f), n - n // 2, replace=False)]
        else:
            picked += [pool[i] for i in rng.choice(len(pool), n, replace=False)]
    return picked


def main():
    sys.path.insert(0, HERE)
    from gen_audio import finish
    from judges import CTC, Whisper, MOS, LangID, cer, to16k, free
    os.makedirs(OUT, exist_ok=True)
    items = sample()
    json.dump(items, open(os.path.join(OUT, "sample.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # Anka (별도 가상환경)
    jobs = [{"name": it["id"], "text": it["google"], "voice": it["voice"], "seed": 0} for it in items]
    jp = os.path.join(OUT, "anka_jobs.json")
    json.dump(jobs, open(jp, "w", encoding="utf-8"), ensure_ascii=False)
    subprocess.run([ANKA_PY, os.path.join(HERE, "anka_synth.py"), jp, os.path.join(OUT, "anka_raw")], check=True)

    # Freya (여성 Leyla 목소리 하나뿐)
    fr = os.path.join(OUT, "freya_raw")
    if not all(os.path.exists(os.path.join(fr, it["id"] + ".wav")) for it in items):
        sys.path.insert(0, FREYA_DIR)
        from freyatts import FreyaTTS
        tts = FreyaTTS.from_pretrained("freyavoice/freya-tts", device="cuda")
        os.makedirs(fr, exist_ok=True)
        for it in items:
            sf.write(os.path.join(fr, it["id"] + ".wav"), tts.synthesize(it["google"]), 48000, subtype="PCM_16")
        del tts
        import torch; torch.cuda.empty_cache()

    sets = {}
    for it in items:
        sets.setdefault("vox", []).append(sf.read(os.path.join(REPO, "audio", it["id"] + ".mp3")))
        for eng in ("anka", "freya"):
            w, sr = sf.read(os.path.join(OUT, f"{eng}_raw", it["id"] + ".wav"))
            sets.setdefault(eng, []).append(finish(w, sr))  # 같은 후처리(다듬기·음량)를 거친 뒤 비교
    x16 = {eng: [to16k(w, sr) for w, sr in v] for eng, v in sets.items()}

    res = {eng: [{} for _ in items] for eng in sets}
    ctc = CTC()
    for eng in sets:
        for r, h, nl in zip(res[eng], ctc(x16[eng]), ctc.nll(x16[eng], [it["google"] for it in items])):
            r["ctc"], r["nll"] = h, nl
    free(ctc)
    wh = Whisper()
    for eng in sets:
        for r, h in zip(res[eng], wh(x16[eng])):
            r["wh"] = h
    free(wh)
    lid = LangID()
    for eng in sets:
        for r, p in zip(res[eng], lid(x16[eng])):
            r["p_tr"], r["p_ko"] = p.get("tr", 0), p.get("ko", 0)
            r["top"] = max(p, key=p.get)
    free(lid)
    mos = MOS()
    for eng in sets:
        for r, m in zip(res[eng], mos(x16[eng])):
            r["mos"] = m
    for eng in sets:
        for it, r in zip(items, res[eng]):
            r["exact"] = cer(it["google"], r["ctc"]) == 0 or cer(it["google"], r["wh"]) == 0
            r["id"], r["src"], r["voice"], r["text"] = it["id"], it["src"][0], it["voice"], it["google"]
    json.dump(res, open(os.path.join(OUT, "report.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    def summary(rows):
        long = [r for r in rows if len(r["text"].split()) >= 3]
        return (f"일치 {sum(r['exact'] for r in rows):3d}/{len(rows)} · nll {np.nanmean([r['nll'] for r in rows]):.3f}"
                f" · P(tr) {np.mean([r['p_tr'] for r in long]):.3f} · P(ko) {np.mean([r['p_ko'] for r in long]):.4f}"
                f" · 튀르키예어 1순위 {sum(r['top'] == 'tr' for r in long)}/{len(long)} · UTMOS {np.mean([r['mos'] for r in rows]):.2f}")
    for eng in sets:
        print(f"[{eng}] 전체  {summary(res[eng])}")
        for src in PLAN:
            rows = [r for r in res[eng] if r["src"] == src]
            print(f"   {src:9s} 일치 {sum(r['exact'] for r in rows):2d}/{len(rows)} · nll {np.nanmean([r['nll'] for r in rows]):.3f} · UTMOS {np.mean([r['mos'] for r in rows]):.2f}")
        m = [r for r in res[eng] if r["voice"] == "m"]
        print(f"   남성 목소리 {len(m)}개: 일치 {sum(r['exact'] for r in m)} · nll {np.nanmean([r['nll'] for r in m]):.3f} · P(tr) {np.mean([r['p_tr'] for r in m]):.3f} · UTMOS {np.mean([r['mos'] for r in m]):.2f}")


if __name__ == "__main__":
    main()
