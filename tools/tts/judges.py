"""생성 음성 채점: CTC(글자 단위, MMS) · Whisper(문장) · UTMOS(자연스러움) · F0(목소리 높이)."""
import re
import numpy as np
import torch
import librosa

# ---------- 비교용 정규화 ----------
ONES = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"]
TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"]


def spell(n):
    if n == 0:
        return "sıfır"
    out = []
    for sc, name in [(10 ** 9, "milyar"), (10 ** 6, "milyon"), (1000, "bin")]:
        if n >= sc:
            head, n = divmod(n, sc)
            if not (sc == 1000 and head == 1):
                out.append(spell(head))
            out.append(name)
    if n >= 100:
        if n // 100 > 1:
            out.append(ONES[n // 100])
        out.append("yüz")
        n %= 100
    if n >= 10:
        out.append(TENS[n // 10])
        n %= 10
    if n:
        out.append(ONES[n])
    return " ".join(out)


def tr_lower(s):
    return s.replace("I", "ı").replace("İ", "i").lower()


def norm_cmp(s):
    """발음 비교용: 같은 소리로 나는 철자 차이·겹자음·띄어쓰기·부호 차이는 무시.
    ğ는 앞모음(e i ö ü) 뒤에서 [j]나 장음(öğle≈öyle), 뒷모음 뒤에서는 앞 모음을 늘이는 소리(dağ≈da)."""
    s = tr_lower(s).replace("̇", "")
    s = re.sub(r"(\d+)[.,](\d{3})\b", r"\1\2", s)
    s = re.sub(r"(\d+)[.,](\d{1,2})\b", lambda m: f"{m.group(1)} {m.group(2)}", s)
    s = re.sub(r"\d+", lambda m: " " + spell(int(m.group(0))) + " ", s)
    s = s.replace("â", "a").replace("î", "i").replace("û", "u")
    s = re.sub(r"(?<=[eiöü])[ğy]", "", s)  # öğle·öyle, yemeği·yemeyi, değil·deyil는 같은 소리로 본다
    s = s.replace("ğ", "")
    s = re.sub(r"[^a-zçıöşü]+", "", s)
    return re.sub(r"(.)\1+", r"\1", s)


def lev(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def cer(ref, hyp):
    r, h = norm_cmp(ref), norm_cmp(hyp)
    return lev(r, h) / max(1, len(r))


def to16k(w, sr):
    w = np.asarray(w, dtype=np.float32)
    if w.ndim > 1:
        w = w.mean(1)
    return librosa.resample(w, orig_sr=sr, target_sr=16000) if sr != 16000 else w


# ---------- 인식기 ----------
class CTC:
    def __init__(self, device="cuda"):
        from transformers import Wav2Vec2ForCTC, AutoProcessor
        mid = "facebook/mms-1b-all"
        self.proc = AutoProcessor.from_pretrained(mid, target_lang="tur")
        self.model = Wav2Vec2ForCTC.from_pretrained(mid, target_lang="tur", ignore_mismatched_sizes=True).to(device).half().eval()
        self.device = device

    @torch.no_grad()
    def __call__(self, wavs16):
        outs = []
        pad = np.zeros(3200, np.float32)
        for x in wavs16:
            inp = self.proc(np.concatenate([pad, x, pad]), sampling_rate=16000, return_tensors="pt")
            ids = torch.argmax(self.model(inp.input_values.to(self.device).half()).logits, dim=-1)[0]
            outs.append(self.proc.decode(ids))
        return outs


class Whisper:
    def __init__(self):
        from transformers import pipeline
        self.p = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3-turbo",
                          dtype=torch.float16, device="cuda:0")

    def __call__(self, wavs16, batch_size=16):
        pad = np.zeros(4000, np.float32)
        items = [{"raw": np.concatenate([pad, x, pad]), "sampling_rate": 16000} for x in wavs16]
        outs = self.p(items, batch_size=batch_size,
                      generate_kwargs={"language": "turkish", "task": "transcribe", "max_new_tokens": 80})
        return [o["text"].strip() for o in outs]


class MOS:
    def __init__(self):
        self.m = torch.hub.load("tarepan/SpeechMOS:v1.2.0", "utmos22_strong", trust_repo=True).cuda().eval()

    @torch.no_grad()
    def __call__(self, wavs16):
        return [float(self.m(torch.from_numpy(x)[None].cuda(), 16000)[0]) for x in wavs16]


def f0_median(x16):
    f0, _, _ = librosa.pyin(x16, fmin=60, fmax=400, sr=16000, frame_length=1024)
    v = f0[~np.isnan(f0)]
    return float(np.median(v)) if len(v) else 0.0


def free(*objs):
    for o in objs:
        del o
    import gc
    gc.collect()
    torch.cuda.empty_cache()
