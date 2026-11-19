import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "WorkSense AI"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:jaul@localhost:5432/worksense_ai"
    SQLITE_FALLBACK_URL: str = "sqlite:///./worksense.db"

    # Security & JWT
    SECRET_KEY: str = "worksense-super-secret-jwt-key-change-in-production-2026-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            import json
            try:
                return json.loads(v)
            except Exception:
                return [i.strip() for i in v.strip("[]").split(",")]
        return v

    # Workload Calculation Engine Parameters (Configurable)
    REPORTING_PERIOD_DAYS: int = 7
    COMPLEXITY_WEIGHT_EASY: float = 1.0
    COMPLEXITY_WEIGHT_MEDIUM: float = 1.2
    COMPLEXITY_WEIGHT_HARD: float = 1.5
    COMPLEXITY_WEIGHT_CRITICAL: float = 2.0

    # Utilization Classification Thresholds (Percentage)
    UTILIZATION_THRESHOLD_UNDERUTILIZED: float = 40.0
    UTILIZATION_THRESHOLD_BALANCED_MAX: float = 80.0
    UTILIZATION_THRESHOLD_HIGH_MAX: float = 100.0

    # Demo Admin
    DEMO_ADMIN_NAME: str = "System Administrator"
    DEMO_ADMIN_EMAIL: str = "admin@worksense.ai"
    DEMO_ADMIN_PASSWORD: str = "AdminPassword123!"

    @property
    def complexity_weights(self) -> dict:
        return {
            "easy": self.COMPLEXITY_WEIGHT_EASY,
            "medium": self.COMPLEXITY_WEIGHT_MEDIUM,
            "hard": self.COMPLEXITY_WEIGHT_HARD,
            "critical": self.COMPLEXITY_WEIGHT_CRITICAL,
        }

settings = Settings()
