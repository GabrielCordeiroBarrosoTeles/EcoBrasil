from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routers import monitoring, predictions, alerts
from .database import engine
from .models import monitoring as monitoring_models
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables with error handling
try:
    monitoring_models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")
    raise

app = FastAPI(
    title="EcoMonitor API",
    description="Sistema Preditivo de Riscos Ambientais",
    version="2.0.0"
)

# CORS with security improvements
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include routers
app.include_router(monitoring.router, prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")

@app.get("/")
async def root():
    try:
        return {"message": "EcoMonitor API v2.0 - Nova Arquitetura"}
    except Exception as e:
        logger.error(f"Error in root endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    try:
        return {"status": "healthy", "version": "2.0.0"}
    except Exception as e:
        logger.error(f"Error in health check: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")