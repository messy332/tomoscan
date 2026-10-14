from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class ProbabilityMap(BaseModel):
    unripe: float
    ripe: float
    overripe: float


class ModelResult(BaseModel):
    prediction: str
    confidence: float
    probabilities: ProbabilityMap
    latency_ms: float


class ScanResponse(BaseModel):
    id: UUID
    image_filename: str
    image_url: str | None
    dt: ModelResult
    rf: ModelResult
    created_at: datetime

    model_config = {"from_attributes": True}


class ScanListItem(BaseModel):
    id: UUID
    image_filename: str
    image_url: str | None
    rf_prediction: str
    rf_confidence: float
    dt_prediction: str
    dt_confidence: float
    created_at: datetime

    model_config = {"from_attributes": True}
