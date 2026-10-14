import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Image metadata (stored path or Supabase Storage URL)
    image_url = Column(String(500), nullable=True)
    image_filename = Column(String(255), nullable=False)

    # ML results
    dt_prediction = Column(Enum("unripe", "ripe", "overripe", name="maturity_label"), nullable=False)
    rf_prediction = Column(Enum("unripe", "ripe", "overripe", name="maturity_label"), nullable=False)
    dt_confidence = Column(Float, nullable=False)
    rf_confidence = Column(Float, nullable=False)
    dt_probabilities = Column(JSON, nullable=False)   # {unripe: 0.1, ripe: 0.8, overripe: 0.1}
    rf_probabilities = Column(JSON, nullable=False)
    dt_latency_ms = Column(Float, nullable=False)
    rf_latency_ms = Column(Float, nullable=False)

    # Extracted features snapshot
    features = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="scans")
