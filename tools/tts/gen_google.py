"""Google Cloud Text-to-Speech(구글 번역기와 같은 구글 음성 엔진)로 녹음 음성 만들기.

  python gen_google.py voices            # 쓸 수 있는 tr-TR 음성 목록
  python gen_google.py audition          # 후보 음성으로 견본 문장을 만들어 채점(UTMOS·인식) → work/google/audition.json
  python gen_google.py build [--f 이름] [--m 이름] [--force]   # 전체 문장 생성 → audio/<id>.mp3, audio-src/qa.json

API 키: 환경 변수 GOOGLE_TTS_API_KEY (Windows는 사용자 환경 변수도 읽는다). 키는 저장소에 넣지 않는다.
이 앱의 분량(약 7만 자)은 Cloud TTS 월 무료 사용량 안에 들어간다.
"""
import argparse, base64, json, os, sys, time
from concurrent.futures import ThreadPoolExecutor
import urllib.request, urllib.error
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", ".."))
WORK = os.path.join(HERE, "work", "google")
API = "https://texttospeech.googleapis.com/v1"
SR = 24000

AUDITION = [
    "Merhaba!",
    "Merhaba, nasılsınız?",
    "Teşekkür ederim.",
    "Bir çay, lütfen.",
    "Ağaç.",
    "Göz.",
    "Kahvaltıda peynir, zeytin ve domates yedik.",
    "Affedersiniz, en yakın eczane nerede?",
    "Iğdır'dan İstanbul'a otobüsle gittim.",
    "Öğretmenimiz çok güzel şarkı söylüyor.",
]


def api_key():
    k = os.environ.get("GOOGLE_TTS_API_KEY")
    if not k and sys.platform == "win32":
        import winreg
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as h:
                k = winreg.QueryValueEx(h, "GOOGLE_TTS_API_KEY")[0]
        except OSError:
            k = None
    if not k:
        sys.exit("GOOGLE_TTS_API_KEY가 없어요 (tools/tts/README.md 참고)")
    return k.strip()


def call(path, body=None, key=None, retries=5):
    url = f"{API}/{path}{'&' if '?' in path else '?'}key={key}"
    data = json.dumps(body).encode() if body is not None else None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")
            if e.code in (429, 500, 503) and i < retries - 1:
                time.sleep(2 ** i)
                continue
            raise RuntimeError(f"HTTP {e.code}: {msg[:300]}")
        except urllib.error.URLError:
            if i < retries - 1:
                time.sleep(2 ** i)
                continue
            raise


def tr_voices(key):
    vs = call("voices?languageCode=tr-TR", key=key)["voices"]
    return sorted(({"name": v["name"], "gender": v["ssmlGender"]} for v in vs), key=lambda v: v["name"])


def synth(text, voice, key, rate=1.0):
    body = {"input": {"text": text}, "voice": {"languageCode": "tr-TR", "name": voice},
            "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": SR, "speakingRate": rate}}
    if "Chirp" in voice:
        body["audioConfig"].pop("speakingRate")  # Chirp 3 HD는 기본 속도 사용
    raw = base64.b64decode(call("text:synthesize", body, key=key)["audioContent"])
    import io
    w, sr = sf.read(io.BytesIO(raw), dtype="float32")
    return w, sr


def kind(name):
    return "chirp" if "Chirp3" in name else "wavenet" if "Wavenet" in name else "neural2" if "Neural2" in name else "standard" if "Standard" in name else "other"


def cmd_voices():
    for v in tr_voices(api_key()):
        print(f"{v['name']:32s} {v['gender']}")


def cmd_audition():
    from judges import CTC, Whisper, MOS, cer, to16k, free
    key = api_key()
    voices = [v for v in tr_voices(key) if kind(v["name"]) in ("chirp", "wavenet", "neural2")]
    os.makedirs(WORK, exist_ok=True)
    rows = []
    for v in voices:
        for i, t in enumerate(AUDITION):
            w, sr = synth(t, v["name"], key)
            rows.append((v, t, w, sr))
        print("견본:", v["name"], flush=True)
    x16 = [to16k(w, sr) for _, _, w, sr in rows]
    ctc = CTC(); ch = ctc(x16); free(ctc)
    wh = Whisper(); whh = wh(x16); free(wh)
    ms = MOS()(x16)
    res = {}
    for (v, t, w, sr), c, w_, m in zip(rows, ch, whh, ms):
        r = res.setdefault(v["name"], {"gender": v["gender"], "kind": kind(v["name"]), "mos": [], "exact": 0})
        r["mos"].append(m)
        r["exact"] += int(cer(t, c) == 0 or cer(t, w_) == 0)
    for n, r in res.items():
        r["mos"] = round(float(np.mean(r["mos"])), 3)
    json.dump(res, open(os.path.join(WORK, "audition.json"), "w", encoding="utf-8"), indent=1)
    for n, r in sorted(res.items(), key=lambda kv: -kv[1]["mos"]):
        print(f"{n:32s} {r['gender']:7s} {r['kind']:8s} UTMOS {r['mos']:.2f} · 인식 일치 {r['exact']}/{len(AUDITION)}")


def pick_default(gender):
    """견본 채점 결과에서 인식이 모두 맞은 음성 중 UTMOS가 가장 높은 것"""
    res = json.load(open(os.path.join(WORK, "audition.json"), encoding="utf-8"))
    cand = [(n, r) for n, r in res.items() if r["gender"] == gender]
    best = max(cand, key=lambda nr: (nr[1]["exact"], nr[1]["mos"]))
    return best[0]


def cmd_build(a):
    sys.path.insert(0, HERE)
    from gen_audio import finish, to_mp3, save_qa
    from judges import CTC, Whisper, MOS, cer, to16k, free
    key = api_key()
    voice = {"f": a.f or pick_default("FEMALE"), "m": a.m or pick_default("MALE")}
    print("목소리:", voice, flush=True)
    texts = json.load(open(os.path.join(REPO, "audio-src", "texts.json"), encoding="utf-8"))["items"]
    qa_path = os.path.join(REPO, "audio-src", "qa.json")
    qa = json.load(open(qa_path, encoding="utf-8")) if os.path.exists(qa_path) else {}
    todo = [it for it in texts if a.force or qa.get(it["id"], {}).get("engine") != voice[it["voice"]]]
    if a.limit:
        todo = todo[: a.limit]
    print(f"만들 문장 {len(todo)}개", flush=True)
    raw_dir = os.path.join(WORK, "raw")
    os.makedirs(raw_dir, exist_ok=True)

    def one(it):
        p = os.path.join(raw_dir, f"{it['id']}.wav")
        if not os.path.exists(p):
            w, sr = synth(it["google"], voice[it["voice"]], key, rate=a.rate)
            sf.write(p + ".part", w, sr, subtype="PCM_16", format="WAV")
            os.replace(p + ".part", p)
        return p

    t0 = time.time()
    with ThreadPoolExecutor(6) as ex:
        paths = []
        for n, p in enumerate(ex.map(one, todo), 1):
            paths.append(p)
            if n % 250 == 0:
                print(f"  합성 {n}/{len(todo)} · {time.time() - t0:.0f}s", flush=True)
    # 검사: 두 인식기 + 자연스러움 점수
    x16 = [to16k(*sf.read(p)) for p in paths]
    ctc = CTC(); ch = ctc(x16); free(ctc)
    wh = Whisper(); whh = wh(x16); free(wh)
    ms = MOS()(x16)
    bad = 0
    for it, p, c, w_, m in zip(todo, paths, ch, whh, ms):
        c1, c2 = cer(it["google"], c), cer(it["google"], w_)
        status = "ok" if (c1 == 0 or c2 == 0 or (len(it["google"]) >= 15 and min(c1, c2) <= 0.05)) else "weak"
        bad += status != "ok"
        w, sr = sf.read(p)
        w2, sr2 = finish(w, sr)
        to_mp3(w2, sr2, os.path.join(REPO, "audio", f"{it['id']}.mp3"))
        qa[it["id"]] = {"text": it["text"], "say": it["google"], "voice": it["voice"], "engine": voice[it["voice"]], "status": status,
                        "c_ctc": round(c1, 3), "c_wh": round(c2, 3), "ctc": c, "wh": w_, "dur": round(len(w2) / sr2, 2), "mos": round(m, 3)}
    save_qa(qa_path, qa)
    print(f"완료 {len(todo)}개 · 인식 불일치(weak) {bad}개 · {time.time() - t0:.0f}s")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["voices", "audition", "build"])
    ap.add_argument("--f", default="")
    ap.add_argument("--m", default="")
    ap.add_argument("--rate", type=float, default=1.0, help="말하기 속도 (1.0 = 구글 번역기와 같은 보통 속도, 앱의 🐢 버튼이 따로 있음)")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    a = ap.parse_args()
    if a.cmd == "voices":
        cmd_voices()
    elif a.cmd == "audition":
        cmd_audition()
    else:
        cmd_build(a)
