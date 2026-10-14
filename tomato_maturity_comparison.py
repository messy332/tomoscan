# Tomato Maturity Classification: Decision Tree vs Random Forest
# Open in VS Code / Jupyter (jupytext) - each "# %%" line is a notebook cell.
# Or run top to bottom as a normal script:  python tomato_maturity_comparison.py
#
# pip install numpy pandas pillow scikit-learn matplotlib seaborn joblib m2cgen

# %% 1. Imports and dataset path
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, ConfusionMatrixDisplay)

DATA_DIR = r"C:\Users\parpa\Downloads\Tomatoes\train"
CLASSES = ["unripe", "ripe", "overripe"]      # label 0, 1, 2
IMG_SIZE = (100, 100)                          # every image is shrunk to this

# %% 2. Check the folders
for c in CLASSES:
    folder = os.path.join(DATA_DIR, c)
    n = len([f for f in os.listdir(folder)
             if f.lower().endswith((".jpg", ".jpeg", ".png"))])
    print(f"{c:9s}: {n} images")

# %% 3. Turn each image into numbers (features)
# A tree cannot "look" at a picture, so we describe each tomato by its COLOUR:
#   - mean and standard deviation of R, G, B and H, S, V   (12 numbers)
#   - a 16-bin Hue histogram (how much red / orange / green is in the picture)
# Total = 28 features per image.
def extract_features(path):
    img = Image.open(path).convert("RGB").resize(IMG_SIZE)
    rgb = np.asarray(img, dtype=np.float32) / 255.0
    hsv = np.asarray(img.convert("HSV"), dtype=np.float32) / 255.0

    feats = []
    for arr in (rgb, hsv):
        for ch in range(3):
            feats.append(arr[:, :, ch].mean())
            feats.append(arr[:, :, ch].std())

    hue_hist, _ = np.histogram(hsv[:, :, 0], bins=16, range=(0, 1))
    feats.extend(hue_hist / hue_hist.sum())
    return feats

columns = ["R_mean", "R_std", "G_mean", "G_std", "B_mean", "B_std",
           "H_mean", "H_std", "S_mean", "S_std", "V_mean", "V_std"] + \
          [f"hue_bin_{i}" for i in range(16)]

rows, labels = [], []
for label, c in enumerate(CLASSES):
    folder = os.path.join(DATA_DIR, c)
    for f in os.listdir(folder):
        if f.lower().endswith((".jpg", ".jpeg", ".png")):
            try:
                rows.append(extract_features(os.path.join(folder, f)))
                labels.append(label)
            except Exception as e:
                print("Skipped", f, e)

df = pd.DataFrame(rows, columns=columns)
df["Maturity"] = labels
df.to_csv("tomato_features.csv", index=False)      # saved so you do not redo this step
print("Rows and columns :", df.shape)
print("Missing values   :", df.isna().sum().sum())
print(df["Maturity"].value_counts().rename(dict(enumerate(CLASSES))))

# %% 4. Split into X (features) and y (answer)
X = df.drop(columns=["Maturity"])
y = df["Maturity"]
print("X shape:", X.shape, "| y shape:", y.shape)

# %% 5. Train / test split (stratify keeps the class balance equal)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print("Training rows:", len(X_train))
print("Testing  rows:", len(X_test))

# %% 6. Train both models
dt = DecisionTreeClassifier(random_state=42)
rf = RandomForestClassifier(n_estimators=100, random_state=42)

dt.fit(X_train, y_train)
rf.fit(X_train, y_train)
print("Both models trained.")

# %% 7. Compare accuracy (train vs test shows overfitting)
results = []
for name, m in [("Decision Tree", dt), ("Random Forest", rf)]:
    results.append({
        "Model": name,
        "Train accuracy": round(m.score(X_train, y_train), 3),
        "Test accuracy":  round(m.score(X_test, y_test), 3),
    })
comparison = pd.DataFrame(results)
print(comparison.to_string(index=False))

# %% 8. Detailed report: precision, recall, F1 per class
for name, m in [("Decision Tree", dt), ("Random Forest", rf)]:
    print(f"\n===== {name} =====")
    print(classification_report(y_test, m.predict(X_test), target_names=CLASSES))

# %% 9. Confusion matrices side by side
fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
for ax, (name, m) in zip(axes, [("Decision Tree", dt), ("Random Forest", rf)]):
    cm = confusion_matrix(y_test, m.predict(X_test))
    ConfusionMatrixDisplay(cm, display_labels=CLASSES).plot(ax=ax, cmap="Reds", colorbar=False)
    ax.set_title(name)
plt.tight_layout()
plt.savefig("confusion_matrices.png", dpi=150)
plt.show()

# %% 10. Which features matter most?
imp = pd.DataFrame({
    "Feature": X.columns,
    "Decision Tree": dt.feature_importances_,
    "Random Forest": rf.feature_importances_,
}).sort_values("Random Forest", ascending=False).head(10)
print(imp.to_string(index=False))

imp.set_index("Feature")[["Decision Tree", "Random Forest"]].plot(kind="barh", figsize=(8, 5))
plt.gca().invert_yaxis()
plt.title("Top 10 feature importances")
plt.tight_layout()
plt.savefig("feature_importance.png", dpi=150)
plt.show()

# %% 11. Predict ONE new tomato image with both models
def predict_image(path):
    f = pd.DataFrame([extract_features(path)], columns=columns)
    for name, m in [("Decision Tree", dt), ("Random Forest", rf)]:
        proba = m.predict_proba(f)[0]
        print(f"{name:14s}-> {CLASSES[int(np.argmax(proba))]:9s}",
              {c: f"{p:.0%}" for c, p in zip(CLASSES, proba)})

# predict_image(r"C:\Users\parpa\Downloads\Tomatoes\train\ripe\your_image.jpg")

# %% 12. Save models + export to Dart for Flutter
# Option A (simplest for your app): export the trained model as plain Dart code.
# No server, no plugin - works offline inside Flutter.
import joblib, m2cgen as m2c

joblib.dump(dt, "decision_tree.joblib")
joblib.dump(rf, "random_forest.joblib")

# Use a smaller forest for export so the Dart file stays a sensible size.
rf_small = RandomForestClassifier(n_estimators=20, max_depth=10, random_state=42)
rf_small.fit(X_train, y_train)
print("Small RF test accuracy:", round(rf_small.score(X_test, y_test), 3))

with open("decision_tree.dart", "w") as f:
    f.write(m2c.export_to_dart(dt))
with open("random_forest.dart", "w") as f:
    f.write(m2c.export_to_dart(rf_small))
print("Saved decision_tree.dart and random_forest.dart")

# In Flutter you must compute the SAME 28 features (same order as `columns`)
# from the camera image, then call score(features). It returns 3 numbers
# (unripe, ripe, overripe) - pick the biggest.