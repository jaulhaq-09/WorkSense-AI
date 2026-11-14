import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("worksense.database")

def get_engine():
    target_url = os.environ.get("DATABASE_URL", settings.DATABASE_URL)
    is_testing = os.environ.get("APP_ENV") == "testing" or target_url.startswith("sqlite")

    if is_testing:
        return create_engine(
            target_url,
            pool_pre_ping=True,
            connect_args={"check_same_thread": False}
        )

    # Attempt to connect to PostgreSQL if target is postgresql
    if target_url.startswith("postgresql"):
        try:
            test_engine = create_engine(
                target_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 2}
            )
            # Test quick connection
            with test_engine.connect() as conn:
                logger.info("Successfully connected to primary PostgreSQL database.")
                return test_engine
        except Exception as e:
            logger.warning(
                f"Could not connect to PostgreSQL at {target_url} ({e}). "
                f"Falling back to local SQLite database at {settings.SQLITE_FALLBACK_URL} for uninterrupted operation."
            )
            target_url = settings.SQLITE_FALLBACK_URL

    connect_args = {"check_same_thread": False} if target_url.startswith("sqlite") else {}
    return create_engine(target_url, pool_pre_ping=True, connect_args=connect_args)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
