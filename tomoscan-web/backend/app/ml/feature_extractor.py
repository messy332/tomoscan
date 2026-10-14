"""
Replicates the exact same 28-feature extraction used during Python training.
Must stay in sync with tomato_maturity_comparison.py.
"""
import io
import numpy as np
from PIL import Image

IMG_SIZE = (100, 100)
FEATURE_COLUMNS = (
    ["R_mean", "R_std", "G_mean", "G_std", "B_mean", "B_std",
     "H_mean", "H_std", "S_mean", "S_std", "V_mean", "V_std"]
    + [f"hue_bin_{i}" for i in range(16)]
)


def extract_features(image_bytes: bytes) -> list[float]:
    """Extract 28 color features from raw image bytes."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)

    rgb = np.asarray(img, dtype=np.float32) / 255.0
    hsv = np.asarray(img.convert("HSV"), dtype=np.float32) / 255.0

    feats: list[float] = []
    for arr in (rgb, hsv):
        for ch in range(3):
            feats.append(float(arr[:, :, ch].mean()))
            feats.append(float(arr[:, :, ch].std()))

    hue_hist, _ = np.histogram(hsv[:, :, 0], bins=16, range=(0, 1))
    total = hue_hist.sum()
    normalized = hue_hist / total if total > 0 else hue_hist
    feats.extend(normalized.tolist())

    return feats  # length 28
