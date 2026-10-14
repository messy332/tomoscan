from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Any
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "TomoScan API"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database (Supabase PostgreSQL)
    DATABASE_URL: str

    # CORS — accepts a JSON array string OR a comma-separated string
    ALLOWED_ORIGINS: Any = ["http://localhost:3000"]

    # File Upload
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: set[str] = {"jpg", "jpeg", "png", "webp"}

    def get_allowed_origins(self) -> list[str]:
        v = self.ALLOWED_ORIGINS
        if isinstance(v, list):
            return v
        try:
            parsed = json.loads(v)
            if isinstance(parsed, list):
                return parsed
        except (ValueError, TypeError):
            pass
        # comma-separated fallback
        return [o.strip() for o in str(v).split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
