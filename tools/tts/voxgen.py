"""VoxCPM2 래퍼: 목소리 프롬프트(이어 말하기) 캐시를 한 번만 만들고 재사용."""
import os
os.environ.setdefault("TQDM_DISABLE", "1")
import numpy as np
import torch


class Vox:
    def __init__(self):
        from voxcpm import VoxCPM
        self.core = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=False, device="cuda")
        self.m = self.core.tts_model
        self.sr = self.m.sample_rate
        self.caches = {}

    def set_voice(self, name, wav_path, text):
        self.caches[name] = self.m.build_prompt_cache(prompt_text=text, prompt_wav_path=wav_path)

    @torch.no_grad()
    def synth(self, text, voice=None, seed=0, steps=10, cfg=2.0, design=None):
        torch.manual_seed(seed)
        np.random.seed(seed % (2 ** 32))
        if design:
            text = f"({design}){text}"
        wav, _, _ = self.m.generate_with_prompt_cache(
            target_text=text, prompt_cache=self.caches.get(voice) if voice else None,
            min_len=2, max_len=2000, inference_timesteps=steps, cfg_value=cfg,
            retry_badcase=True, retry_badcase_max_times=3, retry_badcase_ratio_threshold=6.0)
        return wav.squeeze(0).float().cpu().numpy()
