import io
import os
import re
import uuid

import httpx
from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from ...core.config import get_settings
from ...ml.classifier import predict_single
from ...ml.feature_extractor import extract_features

router = APIRouter(prefix="/scans", tags=["classification"])
SAFE_FILENAME = re.compile(r"[^\w.\-]")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "5"))
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


async def _authenticated_user(authorization: str | None) -> dict:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Sign in to classify an image.")

    settings = get_settings()
    supabase_url = settings.SUPABASE_URL.rstrip("/")
    publishable_key = settings.SUPABASE_PUBLISHABLE_KEY
    if not supabase_url or not publishable_key:
        raise HTTPException(status_code=500, detail="Supabase authentication is not configured.")

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.get(
                f"{supabase_url}/auth/v1/user",
                headers={
                    "apikey": publishable_key,
                    "Authorization": f"Bearer {token}",
                },
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Could not verify the session.") from exc

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Your session is invalid or expired.")
    return response.json()


@router.post("/classify")
async def classify(
    file: UploadFile = File(...),
    authorization: str | None = Header(default=None),
):
    await _authenticated_user(authorization)

    filename = file.filename or "tomato.jpg"
    extension = filename.rsplit(".", 1)[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a JPG, PNG, or WEBP image.")

    content = await file.read(MAX_FILE_SIZE_MB * 1024 * 1024 + 1)
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Image exceeds {MAX_FILE_SIZE_MB}MB.")

    try:
        with Image.open(io.BytesIO(content)) as image:
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from exc

    features = extract_features(content)
    results = predict_single(features)
    safe_name = SAFE_FILENAME.sub("_", filename)[:80]

    return {
        "image_filename": f"{uuid.uuid4().hex}_{safe_name}",
        "dt": results["dt"],
        "rf": results["rf"],
    }