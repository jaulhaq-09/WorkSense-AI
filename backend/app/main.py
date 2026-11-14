import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import engine, Base
from app.database_seed import seed_db
from app.routes.auth import router as auth_router
from app.routes.developers import router as developers_router
from app.routes.teams import router as teams_router
from app.routes.skills import router as skills_router
from app.routes.projects import router as projects_router
from app.routes.tasks import router as tasks_router
from app.routes.time_logs import router as time_logs_router
from app.routes.workload import router as workload_router
from app.routes.recommendations import router as recommendations_router
from app.routes.ml import router as ml_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("worksense.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing WorkSense AI database schema and seed data...")
    try:
        Base.metadata.create_all(bind=engine)
        seed_db()
        logger.info("Database bootstrap completed successfully.")
    except Exception as e:
        logger.error(f"Error during database startup bootstrap: {e}")
    yield
    logger.info("Shutting down WorkSense AI backend.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Developer Workload Imbalance Detector and Redistribution Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
origins = settings.BACKEND_CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
api_prefix = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_prefix)
app.include_router(developers_router, prefix=api_prefix)
app.include_router(teams_router, prefix=api_prefix)
app.include_router(skills_router, prefix=api_prefix)
app.include_router(projects_router, prefix=api_prefix)
app.include_router(tasks_router, prefix=api_prefix)
app.include_router(time_logs_router, prefix=api_prefix)
app.include_router(workload_router, prefix=api_prefix)
app.include_router(recommendations_router, prefix=api_prefix)
app.include_router(ml_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app_env": settings.APP_ENV,
        "database_connected": True
    }
