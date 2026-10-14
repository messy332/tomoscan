# Image Augmentation Script – User Guide

`augment.py` takes every image in a folder and creates 10 randomly transformed copies of each one.
500 originals → 5,000 augmented images.

---

## 1. Requirements

- **Python 3.9 or newer** (check with `python --version`)
- Three packages: `albumentations`, `opencv-python`, `numpy`

## 2. Install dependencies

(Recommended) create a virtual environment first:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

Then install the packages:

```bash
pip install albumentations opencv-python numpy
```

If you have no display/GUI (server, Docker), use `opencv-python-headless` instead of `opencv-python`.

## 3. Folder layout

Put `augment.py` next to your `dataset` folder:

```
your_project/
├── augment.py
└── dataset/
    ├── train/          <- your 500 original images (input)
    └── augmented/      <- created automatically (output)
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.webp`, `.tif`, `.tiff`.
Other files are skipped with a message. Images in sub-folders (e.g. one folder per class) are also
processed, and the sub-folder structure is copied to the output.

## 4. Run it

From inside `your_project/`:

```bash
python augment.py
```

Or with custom options:

```bash
python augment.py --input path/to/originals --output path/to/results --num-aug 10 --seed 42
```

| Option | Default | Meaning |
|---|---|---|
| `--input` | `dataset/train` | Folder with original images |
| `--output` | `dataset/augmented` | Folder where results are saved |
| `--num-aug` | `10` | Augmented copies per original image |
| `--seed` | none | Set a number to make results reproducible |

## 5. What you will see

```
Found 500 image(s) in 'dataset/train'. Generating 10 variants each -> 5000 files in 'dataset/augmented'.
Processed 123/500 images  |  1230 files saved  |  ETA   45s
...
DONE in 182.4s
  Source images processed : 500/500
  Augmented images saved  : 5000
```

The run is finished when the `DONE` summary appears. Any file that could not be read (for example a
corrupt image) is listed at the end, and the script carries on with the rest.

## 6. Output naming

```
dog_012.jpg  ->  dog_012_aug_1.jpg, dog_012_aug_2.jpg, ... dog_012_aug_10.jpg
```

The original filename and extension are kept, so you can always trace an augmented image back to its source.

## 7. What transformations are applied

Each augmented image gets a random mix of these (each fires with its own probability):

| Transformation | Range |
|---|---|
| Horizontal flip | 50% chance |
| Rotation | −25° to +25° |
| Zoom (scale) | 0.85× to 1.20× |
| Shift (translate) | up to ±10% in x and y |
| Brightness / contrast | ±25% |
| Hue / saturation / value | small, realistic changes |
| Gaussian blur | light, 20% chance |

To change them, edit the `build_pipeline()` function in `augment.py`. For example, add
`A.VerticalFlip(p=0.5)` to the list, or widen `rotate=(-25, 25)` to `rotate=(-45, 45)`.

**Tip:** don't use horizontal flips if left/right matters for your task (e.g. reading text or digits).
Remove the `A.HorizontalFlip(...)` line in that case.

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `Albumentations is not installed` | Run `pip install albumentations opencv-python numpy` |
| `Input folder not found` | Check the path. Run the script from the folder containing `dataset/`, or pass `--input` with the full path |
| `No supported images found` | Make sure the files have one of the supported extensions |
| `file could not be decoded` for some files | That image is corrupt or not a real image; replace it |
| `ImportError: libGL.so.1` on Linux | Use `pip install opencv-python-headless` |
| PNGs with transparency lose it | Images are loaded as 3-channel RGB, so transparent areas become opaque |
| Re-running overwrites files | Same names are replaced. Use a new `--output` folder to keep older results |
| Different results each run | Normal. Add `--seed 42` for repeatable output |

## 9. Next step: using the data

Combine `dataset/train` (originals) and `dataset/augmented` for training. Keep your validation/test
images un-augmented so your accuracy numbers stay honest.
