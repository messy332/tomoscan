import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.deps import get_current_user
from ...core.config import get_settings
from ...models.user import User
from ...models.scan import ScanRecord
from ...ml.feature_extractor import extract_features
from ...ml.classifier import predict_single
from ...schemas.scan import ScanResponse, ScanListItem, ModelResult, ProbabilityMap

router = APIRouter(prefix="/scans", tags=["scans"])
settings = get_settings()

SAFE_FILENAME = re.compile(r"[^\w.\-]")

# Magic byte signatures for allowed image types
_MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
    b"RIFF": "image/webp",  # RIFF....WEBP
}

def _detect_mime(header: bytes) -> str:
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"
    for sig, mime in _MAGIC_BYTES.items():
        if header[:len(sig)] == sig and mime != "image/webp":
            return mime
    return "application/octet-stream"


def _validate_upload(file: UploadFile, content: bytes):
    # Extension check
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type .{ext} not allowed")

    # Size check
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit")

    # MIME type check (real magic bytes, not just extension)
    mime = _detect_mime(content[:12])
    if mime not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(400, f"Invalid file content: {mime}")


def _sanitize_filename(name: str) -> str:
    base = SAFE_FILENAME.sub("_", name or "upload")
    return f"{uuid.uuid4().hex}_{base[:80]}"


@router.post("/classify", response_model=ScanResponse, status_code=201)
async def classify(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    _validate_upload(file, content)

    safe_name = _sanitize_filename(file.filename or "image.jpg")
    features = extract_features(content)
    results = predict_single(features)

    def make_model_result(r: dict) -> ModelResult:
        return ModelResult(
            prediction=r["prediction"],
            confidence=r["confidence"],
            probabilities=ProbabilityMap(**r["probabilities"]),
            latency_ms=r["latency_ms"],
        )

    record = ScanRecord(
        user_id=current_user.id,
        image_filename=safe_name,
        dt_prediction=results["dt"]["prediction"],
        rf_prediction=results["rf"]["prediction"],
        dt_confidence=results["dt"]["confidence"],
        rf_confidence=results["rf"]["confidence"],
        dt_probabilities=results["dt"]["probabilities"],
        rf_probabilities=results["rf"]["probabilities"],
        dt_latency_ms=results["dt"]["latency_ms"],
        rf_latency_ms=results["rf"]["latency_ms"],
        features=features,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ScanResponse(
        id=record.id,
        image_filename=record.image_filename,
        image_url=record.image_url,
        dt=make_model_result(results["dt"]),
        rf=make_model_result(results["rf"]),
        created_at=record.created_at,
    )


@router.get("/history", response_model=list[ScanListItem])
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(ScanRecord)
        .filter(ScanRecord.user_id == current_user.id)
        .order_by(ScanRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return records
