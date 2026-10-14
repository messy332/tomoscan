from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    is_active: bool | None = None
    role: str | None = None
