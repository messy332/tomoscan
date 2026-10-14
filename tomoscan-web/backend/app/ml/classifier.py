"""
Loads the pre-trained Decision Tree and Random Forest models,
runs inference, and returns a full comparison report.
"""
import time
import pathlib
import numpy as np
import joblib

CLASSES = ["unripe", "ripe", "overripe"]
MODEL_DIR = pathlib.Path(__file__).parent / "models"


def _load_models():
    dt = joblib.load(MODEL_DIR / "decision_tree.joblib")
    rf = joblib.load(MODEL_DIR / "random_forest.joblib")
    return dt, rf


# Load once at startup
_dt_model, _rf_model = None, None


def get_models():
    global _dt_model, _rf_model
    if _dt_model is None:
        _dt_model, _rf_model = _load_models()
    return _dt_model, _rf_model


def predict_single(features: list[float]) -> dict:
    """Run both models on a single feature vector. Returns comparison dict."""
    dt, rf = get_models()
    X = np.array(features).reshape(1, -1)

    results = {}
    for name, model, key in [("Decision Tree", dt, "dt"), ("Random Forest", rf, "rf")]:
        t0 = time.perf_counter()
        proba = model.predict_proba(X)[0]
        latency_ms = (time.perf_counter() - t0) * 1000

        best_idx = int(np.argmax(proba))
        results[key] = {
            "prediction": CLASSES[best_idx],
            "confidence": float(proba[best_idx]),
            "probabilities": {c: float(p) for c, p in zip(CLASSES, proba)},
            "latency_ms": round(latency_ms, 4),
        }

    return results


def get_evaluation_report() -> dict:
    """
    Runs full evaluation on the training CSV with 5-fold CV.
    Returns accuracy, per-class metrics, confusion matrices, CV scores.
    """
    from pathlib import Path
    import pandas as pd
    from sklearn.model_selection import cross_val_score
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

    csv_path = MODEL_DIR / "tomato_features.csv"
    if not csv_path.exists():
        return {"error": "Feature CSV not found. Place tomato_features.csv in ml/models/"}

    df = pd.read_csv(csv_path)
    X = df.drop(columns=["Maturity"]).values
    y = df["Maturity"].values

    dt, rf = get_models()
    report = {}

    for name, model, key in [("Decision Tree", dt, "dt"), ("Random Forest", rf, "rf")]:
        preds = model.predict(X)
        cr = classification_report(y, preds, target_names=CLASSES, output_dict=True)
        cm = confusion_matrix(y, preds).tolist()
        cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")

        report[key] = {
            "name": name,
            "accuracy": round(accuracy_score(y, preds), 4),
            "cv_mean": round(float(cv_scores.mean()), 4),
            "cv_std": round(float(cv_scores.std()), 4),
            "cv_scores": [round(s, 4) for s in cv_scores.tolist()],
            "classification_report": cr,
            "confusion_matrix": cm,
            "classes": CLASSES,
        }

    return report
