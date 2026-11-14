import os

# Set testing environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite:///./test_worksense.db"
os.environ["APP_ENV"] = "testing"

import pytest
from starlette.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.database import Base, get_db
import app.database as db_module

TEST_DB_URL = "sqlite:///./test_worksense.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Override engine in database module
db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal

from app.database_seed import seed_db
from app.main import app

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    seed_db()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_worksense.db"):
        try:
            os.remove("./test_worksense.db")
        except Exception:
            pass

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app, raise_server_exceptions=True)
    yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token(client):
    res = client.post("/api/auth/login", json={
        "email": settings.DEMO_ADMIN_EMAIL,
        "password": settings.DEMO_ADMIN_PASSWORD
    })
    assert res.status_code == 200
    return res.json()["access_token"]

@pytest.fixture
def pm_token(client):
    res = client.post("/api/auth/login", json={
        "email": "pm@worksense.ai",
        "password": "Password123!"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

@pytest.fixture
def dev_token(client):
    res = client.post("/api/auth/login", json={
        "email": "alex@worksense.ai",
        "password": "Password123!"
    })
    assert res.status_code == 200
    return res.json()["access_token"]
