"""앱 녹음 음성 일괄 생성: 합성(VoxCPM2 이어 말하기) → 채점(CTC·Whisper) → 재시도 → 후처리 → MP3.

  python gen_audio.py [--repo <앱 저장소>] [--limit N] [--src word,example] [--max-tries 5] [--steps 10]

- 입력: <repo>/audio-src/texts.json (node scripts/audio.mjs texts)
- 출력: <repo>/audio/<id>.mp3, 품질 기록 <repo>/audio-src/qa.json
- 이미 MP3가 있는 문장은 건너뛴다(같은 문장·목소리면 같은 파일 이름).
"""
import argparse, json, os, subprocess, sys, time
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE_DIR = os.path.join(HERE, "voices")
MP3_MOS_DROP = 0.11  # 다듬기·MP3 변환 뒤 UTMOS가 평균적으로 내려가는 폭 (시험 120개 기준)


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


# ---------- 판정 ----------
def verdict(text, c_ctc, c_wh, dur):
    from judges import norm_cmp
    n = max(1, len(norm_cmp(text)))
    if dur < 0.2 or dur > 0.45 * n + 1.5:
        return False
    if c_ctc == 0 or c_wh == 0:
        return True
    return n >= 15 and min(c_ctc, c_wh) <= 0.05


def badness(c_ctc, c_wh):
    return min(c_ctc, c_wh) + 0.3 * max(min(c_ctc, 2), min(c_wh, 2))


# ---------- 후처리 ----------
def finish(w, sr):
    """무음 다듬기 · 음량 맞추기(-18 LUFS, 피크 -1.5 dBFS) · 24 kHz."""
    import librosa, pyloudnorm as pyln
    w = np.asarray(w, dtype=np.float64)
    w = w - np.mean(w)
    hop, win = int(0.01 * sr), int(0.025 * sr)
    rms = librosa.feature.rms(y=w, frame_length=win, hop_length=hop, center=True)[0]
    db = 20 * np.log10(rms + 1e-9)
    thr = max(-55.0, db.max() - 42)
    on = np.where(db > thr)[0]
    if len(on):
        a = max(0, on[0] * hop - int(0.04 * sr))
        b = min(len(w), on[-1] * hop + win + int(0.12 * sr))
        w = w[a:b]
    fi, fo = int(0.006 * sr), int(0.03 * sr)
    w[:fi] *= np.linspace(0, 1, fi)
    w[-fo:] *= np.linspace(1, 0, fo)
    meter = pyln.Meter(sr)
    padded = np.concatenate([w, np.zeros(int(0.5 * sr))]) if len(w) < 0.6 * sr else w
    loud = meter.integrated_loudness(padded)
    if np.isfinite(loud):
        w = w * 10 ** ((-18.0 - loud) / 20)
    peak = np.max(np.abs(w)) + 1e-9
    if peak > 0.84:  # -1.5 dBFS
        w = w * (0.84 / peak)
    w = librosa.resample(w, orig_sr=sr, target_sr=24000, res_type="soxr_hq")
    return w.astype(np.float32), 24000


def to_mp3(w, sr, path):
    import imageio_ffmpeg
    tmp = path + ".tmp.wav"
    sf.write(tmp, w, sr, subtype="PCM_16")
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-i", tmp, "-ac", "1", "-ar", str(sr),
                    "-c:a", "libmp3lame", "-b:a", "48k", "-map_metadata", "-1", "-id3v2_version", "0", path], check=True)
    os.remove(tmp)


# ---------- 단계 ----------
def stage_gen(items, attempt, work, steps, cfg=2.0):
    import torch
    from voxgen import Vox
    v = Vox()
    for name in ("f", "m"):
        v.set_voice(name, os.path.join(VOICE_DIR, f"{name}.wav"), open(os.path.join(VOICE_DIR, f"{name}.txt"), encoding="utf-8").read().strip())
    t0, made = time.time(), 0
    for i, it in enumerate(items):
        out = os.path.join(work, "cand", f"{it['id']}_{attempt}.wav")
        if os.path.exists(out):
            continue
        wav = v.synth(it["say"], voice=it["voice"], seed=1000 + attempt * 7919, steps=steps, cfg=cfg)
        sf.write(out + ".part", wav, v.sr, subtype="PCM_16", format="WAV")
        os.replace(out + ".part", out)  # 중간에 멈춰도 반쯤 쓴 파일이 남지 않게
        made += 1
        if made % 50 == 0:
            el = time.time() - t0
            log(f"  합성 {i + 1}/{len(items)} · {el / made:.2f}s/개 · 남은 시간 약 {el / made * (len(items) - i - 1) / 60:.0f}분")
    del v
    torch.cuda.empty_cache()


def stage_judge(items, attempt, work, scores):
    from judges import CTC, Whisper, MOS, cer, to16k, free
    todo = [it for it in items if f"{it['id']}_{attempt}" not in scores]
    if not todo:
        return
    x16, durs = [], []
    for it in todo:
        w, sr = sf.read(os.path.join(work, "cand", f"{it['id']}_{attempt}.wav"))
        x16.append(to16k(w, sr))
        durs.append(len(w) / sr)
    ctc = CTC(); ch = ctc(x16); free(ctc)
    wh = Whisper(); whh = wh(x16); free(wh)
    mos = MOS(); ms = mos(x16); free(mos)
    with open(os.path.join(work, "scores.jsonl"), "a", encoding="utf-8") as fp:
        for it, c, w_, d, m in zip(todo, ch, whh, durs, ms):
            row = {"cand": f"{it['id']}_{attempt}", "ctc": c, "wh": w_, "c_ctc": cer(it["say"], c), "c_wh": cer(it["say"], w_),
                   "dur": d, "mos": round(m, 3)}
            scores[row["cand"]] = row
            fp.write(json.dumps(row, ensure_ascii=False) + "\n")


def stage_pick(items, attempt, work, scores, qa, out_dir, max_tries, final=False, fresh=None, prev=None):
    """fresh: {id: 시작 회차} — 이 문장은 이전 후보를 버리고 그 회차부터 만든 후보만 본다 (--redo)
    prev: {id: 예전 기록} — 새 후보가 예전 녹음보다 자연스럽지 않으면(UTMOS) 예전 것을 둔다"""
    fresh, prev = fresh or {}, prev or {}
    done = 0
    for it in items:
        lo = fresh.get(it["id"], 0)
        cands = [scores[f"{it['id']}_{a}"] | {"attempt": a} for a in range(lo, attempt + 1) if f"{it['id']}_{a}" in scores]
        ok = [c for c in cands if verdict(it["say"], c["c_ctc"], c["c_wh"], c["dur"])]
        status = None
        if ok:
            # 정확히 맞은 후보를 먼저, 그중 자연스러움 점수가 높은 것
            best, status = min(ok, key=lambda c: (badness(c["c_ctc"], c["c_wh"]) > 0.001, -c.get("mos", 0), c["attempt"])), "ok"
        elif attempt + 1 >= max_tries or final:
            best = min(cands, key=lambda c: badness(c["c_ctc"], c["c_wh"]))
            status = "weak" if min(best["c_ctc"], best["c_wh"]) <= 0.25 and best["dur"] < 0.45 * len(it["say"]) + 1.5 else "fail"
        if not status:
            continue
        old = prev.get(it["id"])
        # 예전 점수는 MP3로 잰 값(qa_voice.py), 후보 점수는 원본 WAV 값 → MP3 변환에 따른 하락분만큼 빼고 비교
        if old and old.get("status") == "ok" and (status != "ok" or best.get("mos", 0) - MP3_MOS_DROP <= old.get("mos", 0)):
            qa[it["id"]] = old  # 예전 녹음이 더 낫다
            done += 1
            continue
        rec = {"text": it["text"], "say": it["say"], "voice": it["voice"], "status": status, "attempt": best["attempt"],
               "c_ctc": round(best["c_ctc"], 3), "c_wh": round(best["c_wh"], 3), "ctc": best["ctc"], "wh": best["wh"]}
        if "mos" in best:
            rec["mos"] = best["mos"]
        if status != "fail":
            w, sr = sf.read(os.path.join(work, "cand", f"{best['cand']}.wav"))
            w2, sr2 = finish(w, sr)
            to_mp3(w2, sr2, os.path.join(out_dir, f"{it['id']}.mp3"))
            rec["dur"] = round(len(w2) / sr2, 2)
        qa[it["id"]] = rec
        done += 1
    return done


def save_qa(path, qa):
    with open(path, "w", encoding="utf-8") as fp:
        fp.write("{\n" + ",\n".join(f"{json.dumps(k)}: {json.dumps(qa[k], ensure_ascii=False)}" for k in sorted(qa)) + "\n}\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.path.normpath(os.path.join(HERE, "..", "..")))
    ap.add_argument("--work", default=os.path.join(HERE, "work"))
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--src", default="")
    ap.add_argument("--per-src", type=int, default=0, help="출처별 앞에서 N개만 (시험용)")
    ap.add_argument("--max-tries", type=int, default=5)
    ap.add_argument("--steps", type=int, default=10)
    ap.add_argument("--cfg", type=float, default=2.0)
    ap.add_argument("--retry-weak", action="store_true", help="weak/fail 판정 문장을 다시 만든다")
    ap.add_argument("--redo", default="", help="이 파일에 적힌 id를 이전 후보 없이 새로 만든다 (qa_voice.py 결과)")
    a = ap.parse_args()
    redo = set(open(a.redo, encoding="utf-8").read().split()) if a.redo else set()

    texts = json.load(open(os.path.join(a.repo, "audio-src", "texts.json"), encoding="utf-8"))["items"]
    out_dir = os.path.join(a.repo, "audio")
    qa_path = os.path.join(a.repo, "audio-src", "qa.json")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(os.path.join(a.work, "cand"), exist_ok=True)
    qa = json.load(open(qa_path, encoding="utf-8")) if os.path.exists(qa_path) else {}
    scores = {}
    sp = os.path.join(a.work, "scores.jsonl")
    if os.path.exists(sp):
        from judges import cer
        say = {it["id"]: it["say"] for it in texts}
        for line in open(sp, encoding="utf-8"):
            r = json.loads(line)
            i = r["cand"].rsplit("_", 1)[0]
            if i in say:  # 채점 규칙이 바뀌었을 수 있으니 저장된 받아쓰기로 다시 계산
                r["c_ctc"], r["c_wh"] = cer(say[i], r["ctc"]), cer(say[i], r["wh"])
            scores[r["cand"]] = r

    def need(it):
        if it["id"] in redo:
            return True
        if a.retry_weak and qa.get(it["id"], {}).get("status") in ("weak", "fail"):
            return True
        return not os.path.exists(os.path.join(out_dir, f"{it['id']}.mp3")) and it["id"] not in qa
    pending = [it for it in texts if need(it) and (not a.src or it["src"][0] in a.src.split(","))]
    if a.per_src:
        seen = {}
        pending = [it for it in pending if seen.setdefault(it["src"][0], []).append(1) or len(seen[it["src"][0]]) <= a.per_src]
    if a.limit:
        pending = pending[: a.limit]
    log(f"생성할 문장 {len(pending)}개 (전체 {len(texts)})")
    attempt = 0
    before = {it["id"]: qa[it["id"]] for it in pending if it["id"] in qa}
    if a.retry_weak or redo:
        for it in pending:
            qa.pop(it["id"], None)
        attempt = max([int(k.rsplit("_", 1)[1]) for k in scores] + [-1]) + 1
    first = attempt
    fresh = {i: first for i in redo}
    if a.retry_weak and attempt > 0:
        # 먼저 이미 있는 후보를 바뀐 채점 규칙으로 다시 골라 본다 (새로 만들 필요가 없을 수도)
        retry = [it for it in pending if it["id"] not in redo]
        n = stage_pick(retry, attempt - 1, a.work, scores, qa, out_dir, first + a.max_tries)
        save_qa(qa_path, qa)
        pending = [it for it in pending if it["id"] not in qa]
        log(f"기존 후보로 확정 {n}개 · 새로 만들 문장 {len(pending)}개")
    while pending and attempt < first + a.max_tries:
        log(f"[{attempt + 1}회차] 합성 {len(pending)}개")
        stage_gen(pending, attempt, a.work, a.steps, a.cfg)
        log(f"[{attempt + 1}회차] 채점")
        stage_judge(pending, attempt, a.work, scores)
        n = stage_pick(pending, attempt, a.work, scores, qa, out_dir, first + a.max_tries,
                       final=attempt + 1 >= first + a.max_tries, fresh=fresh, prev={i: before[i] for i in redo if i in before})
        save_qa(qa_path, qa)
        pending = [it for it in pending if it["id"] not in qa]
        st = {}
        for r in qa.values():
            st[r["status"]] = st.get(r["status"], 0) + 1
        log(f"[{attempt + 1}회차] 확정 {n}개 · 남음 {len(pending)}개 · 누적 {st}")
        attempt += 1
    # 다시 만들기에 실패했으면 예전 녹음(과 기록)을 그대로 둔다
    kept = [i for i, r in before.items() if qa.get(i, {}).get("status") == "fail" and r["status"] != "fail"]
    for i in kept:
        qa[i] = before[i]
    if kept:
        save_qa(qa_path, qa)
        log(f"새로 만들지 못해 예전 녹음을 유지: {len(kept)}개")


if __name__ == "__main__":
    main()
