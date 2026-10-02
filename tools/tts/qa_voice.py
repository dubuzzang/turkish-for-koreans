"""완성된 MP3 점검: 목소리 일관성(음높이 F0)·말 빠르기·자연스러움(UTMOS)이 평소 범위를 벗어난 클립을 찾는다.
  python qa_voice.py [--repo <저장소>] [--out work/redo.txt]
- 각 클립의 UTMOS 점수를 audio-src/qa.json에 적는다(다시 만들 때 예전 것보다 나은지 비교용).
- 결과 목록은 gen_audio.py --redo work/redo.txt 로 다시 만든다(새 후보가 더 나을 때만 바뀜).
"""
import argparse, json, os, re
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import soundfile as sf
import librosa

HERE = os.path.dirname(os.path.abspath(__file__))


def load16(path):
    y, sr = sf.read(path)
    if y.ndim > 1:
        y = y.mean(1)
    return librosa.resample(y.astype(np.float32), orig_sr=sr, target_sr=16000)


def f0_of(y):
    f0, _, _ = librosa.pyin(y, fmin=60, fmax=450, sr=16000, frame_length=1024)
    v = f0[~np.isnan(f0)]
    return float(np.median(v)) if len(v) >= 5 else None


def bucket(n):
    return 0 if n <= 5 else 1 if n <= 12 else 2 if n <= 30 else 3


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.path.normpath(os.path.join(HERE, "..", "..")))
    ap.add_argument("--out", default=os.path.join(HERE, "work", "redo.txt"))
    ap.add_argument("--mos-pct", type=float, default=4.0, help="길이 구간마다 UTMOS 하위 몇 %를 다시 만들지")
    a = ap.parse_args()
    qa_path = os.path.join(a.repo, "audio-src", "qa.json")
    qa = json.load(open(qa_path, encoding="utf-8"))
    items = [(k, r) for k, r in qa.items() if r["status"] != "fail" and os.path.exists(os.path.join(a.repo, "audio", f"{k}.mp3"))]
    with ThreadPoolExecutor(8) as ex:
        ys = list(ex.map(lambda kr: load16(os.path.join(a.repo, "audio", f"{kr[0]}.mp3")), items))
    with ThreadPoolExecutor(8) as ex:
        f0s = list(ex.map(f0_of, ys))
    from judges import MOS
    mos = MOS()
    ms = mos(ys)

    rows = []
    for (k, r), y, f0, m in zip(items, ys, f0s, ms):
        dur = len(y) / 16000
        n = len(re.sub(r"[^a-zçğıöşüâîû]", "", r["say"].lower()))
        qa[k]["mos"] = round(m, 3)
        rows.append({"id": k, "voice": r["voice"], "f0": f0, "dur": dur, "cps": n / max(dur, 0.1), "n": n, "mos": m, "say": r["say"]})

    redo = {}
    for voice in ("f", "m"):
        vr = [r for r in rows if r["voice"] == voice]
        f0v = np.array([r["f0"] for r in vr if r["f0"]])
        med = float(np.median(f0v))
        cps = np.array([r["cps"] for r in vr if r["n"] >= 12])
        c_lo, c_hi = np.percentile(cps, 0.5), np.percentile(cps, 99.5)
        print(f"[{voice}] {len(vr)}개 · F0 중앙 {med:.0f}Hz (1~99%: {np.percentile(f0v, 1):.0f}~{np.percentile(f0v, 99):.0f})"
              f" · 초당 글자 {np.median(cps):.1f} ({c_lo:.1f}~{c_hi:.1f}) · UTMOS 평균 {np.mean([r['mos'] for r in vr]):.2f}")
        for r in vr:
            # 여성 목소리인데 남성 음역(또는 반대)처럼 크게 벗어난 클립, 지나치게 느리거나 빠른 클립
            if r["f0"] and (r["f0"] < med * 0.72 or r["f0"] > med * 1.38):
                redo[r["id"]] = f"F0 {r['f0']:.0f}"
            elif r["n"] >= 12 and (r["cps"] < c_lo * 0.9 or r["cps"] > c_hi * 1.1):
                redo[r["id"]] = f"빠르기 {r['cps']:.1f}"
    for b in range(4):
        br = [r for r in rows if bucket(r["n"]) == b]
        if len(br) < 20:
            continue
        cut = np.percentile([r["mos"] for r in br], a.mos_pct)
        print(f"  길이 구간 {b}: {len(br)}개 · UTMOS 중앙 {np.median([r['mos'] for r in br]):.2f} · 하위 {a.mos_pct:g}% 기준 {cut:.2f}")
        for r in br:
            if r["mos"] < cut and r["id"] not in redo:
                redo[r["id"]] = f"UTMOS {r['mos']:.2f}"
    for i, why in list(redo.items())[:40]:
        print(f"   {i} {why} | {qa[i]['say'][:60]}")

    from gen_audio import save_qa
    save_qa(qa_path, qa)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, "w", encoding="utf-8").write("".join(f"{i}\n" for i in redo))
    print(f"다시 만들 클립 {len(redo)}개 → {a.out}")


if __name__ == "__main__":
    main()
