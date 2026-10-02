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

    @torch.no_grad()
    def nll(self, wavs16, texts):
        """발음 일치도: 튀르키예어 음향모델이 본 '이 글을 이렇게 읽었을 확률'의 음의 로그(글자당). 낮을수록 원어민 발음에 가깝다."""
        import torch.nn.functional as F
        outs = []
        pad = np.zeros(3200, np.float32)
        blank = self.proc.tokenizer.pad_token_id
        for x, t in zip(wavs16, texts):
            inp = self.proc(np.concatenate([pad, x, pad]), sampling_rate=16000, return_tensors="pt")
            lp = self.model(inp.input_values.to(self.device).half()).logits.float().log_softmax(-1).transpose(0, 1)
            s = re.sub(r"[^a-zçğıöşüâîû ]+", " ", tr_lower(t)).strip()
            s = re.sub(r"\s+", " ", s)
            ids = [i for i in self.proc.tokenizer(s).input_ids if i != self.proc.tokenizer.unk_token_id]
            if not ids:
                outs.append(float("nan"))
                continue
            loss = F.ctc_loss(lp, torch.tensor([ids]), torch.tensor([lp.shape[0]]), torch.tensor([len(ids)]),
                              blank=blank, reduction="sum", zero_infinity=True)
            outs.append(float(loss) / len(ids))
        return outs


class LangID:
    """Whisper 언어 판별: 이 소리가 어느 언어로 들리는지 확률 (억양 점검 — 한국어처럼 들리면 P(ko)가 오른다)"""

    def __init__(self):
        from transformers import WhisperProcessor, WhisperForConditionalGeneration
        from transformers.models.whisper.tokenization_whisper import LANGUAGES
        mid = "openai/whisper-large-v3-turbo"
        self.proc = WhisperProcessor.from_pretrained(mid)
        self.model = WhisperForConditionalGeneration.from_pretrained(mid, dtype=torch.float16).cuda().eval()
        tok = self.proc.tokenizer
        self.codes = [c for c in LANGUAGES if tok.convert_tokens_to_ids(f"<|{c}|>") != tok.unk_token_id]
        self.ids = torch.tensor([tok.convert_tokens_to_ids(f"<|{c}|>") for c in self.codes]).cuda()
        self.sot = tok.convert_tokens_to_ids("<|startoftranscript|>")

    @torch.no_grad()
    def __call__(self, wavs16):
        outs = []
        for x in wavs16:
            feats = self.proc(x, sampling_rate=16000, return_tensors="pt").input_features.cuda().half()
            logits = self.model(input_features=feats, decoder_input_ids=torch.tensor([[self.sot]]).cuda()).logits[0, -1].float()
            p = logits[self.ids].softmax(-1)
            outs.append({c: float(v) for c, v in zip(self.codes, p.tolist())})
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
