"""음높이(F0)가 그 목소리의 평소 범위를 벗어난 클립을, 범위 안에 드는 후보(발음 검사 통과, UTMOS 가장 높은 것)로 바꾼다.
  python fix_pitch.py [--work <작업 폴더>]   # qa_voice.py → gen_audio.py --redo 다음에 실행
"""
import argparse, json, os
import soundfile as sf
from gen_audio import verdict, finish, to_mp3, save_qa, MP3_MOS_DROP
from judges import cer
from qa_voice import load16, f0_of

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", ".."))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", default=os.path.join(HERE, "work"))
    a = ap.parse_args()
    qa_path = os.path.join(REPO, "audio-src", "qa.json")
    qa = json.load(open(qa_path, encoding="utf-8"))
    texts = {i["id"]: i for i in json.load(open(os.path.join(REPO, "audio-src", "texts.json"), encoding="utf-8"))["items"]}
    scores = {}
    for line in open(os.path.join(a.work, "scores.jsonl"), encoding="utf-8"):
        r = json.loads(line)
        scores[r["cand"]] = r
    # 목소리별 평소 음높이(중앙값)를 지금 파일들에서 잰다
    f0 = {}
    for i, r in qa.items():
        p = os.path.join(REPO, "audio", f"{i}.mp3")
        if r["status"] != "fail" and os.path.exists(p):
            f0[i] = f0_of(load16(p))
    import numpy as np
    med = {v: float(np.median([f0[i] for i in f0 if f0[i] and qa[i]["voice"] == v])) for v in ("f", "m")}
    in_range = lambda v, x: x is not None and med[v] * 0.72 <= x <= med[v] * 1.38
    fixed = 0
    for i, now in f0.items():
        r = qa[i]
        if now is None or in_range(r["voice"], now):
            continue
        say = texts[i]["say"]
        best = None
        for key in [k for k in scores if k.rsplit("_", 1)[0] == i]:
            c = scores[key]
            if not verdict(say, cer(say, c["ctc"]), cer(say, c["wh"]), c["dur"]):
                continue
            p = os.path.join(a.work, "cand", f"{key}.wav")
            if not os.path.exists(p):
                continue
            x = f0_of(load16(p))
            if in_range(r["voice"], x) and (best is None or c.get("mos", 0) > best[0].get("mos", 0)):
                best = (c, p, x)
        if not best:
            print(f"  그대로: {say} (F0 {now:.0f}, 범위 안 후보 없음)")
            continue
        c, p, x = best
        w, sr = sf.read(p)
        w2, sr2 = finish(w, sr)
        to_mp3(w2, sr2, os.path.join(REPO, "audio", f"{i}.mp3"))
        qa[i] = {**r, "status": "ok", "attempt": int(c["cand"].rsplit("_", 1)[1]), "ctc": c["ctc"], "wh": c["wh"],
                 "c_ctc": round(cer(say, c["ctc"]), 3), "c_wh": round(cer(say, c["wh"]), 3),
                 "dur": round(len(w2) / sr2, 2), "mos": round(c.get("mos", 0) - MP3_MOS_DROP, 3)}
        fixed += 1
        print(f"  교체: {say} F0 {now:.0f} → {x:.0f}")
    save_qa(qa_path, qa)
    print(f"음높이 교체 {fixed}개 (평소 F0 여성 {med['f']:.0f}Hz · 남성 {med['m']:.0f}Hz)")


if __name__ == "__main__":
    main()
