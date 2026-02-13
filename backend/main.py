from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.db.database import engine, Base
from backend.app.auth.router import router as auth_router
from backend.app.users.router import router as users_router
from backend.app.services.router import router as services_router
from backend.app.slots.router import router as slots_router
from backend.app.appointments.router import router as appointments_router
from backend.app.prediction.router import router as prediction_router
from backend.app.admin.router import router as admin_router
from backend.app.recommendations.router import router as recommendations_router
from backend.app.analytics.router import router as analytics_router
from backend.app.websocket.router import router as websocket_router

# Create all tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "SYSTEM ONLINE"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(services_router, prefix="/api/services", tags=["Services"])
app.include_router(slots_router, prefix="/api/slots", tags=["Slots"])
app.include_router(appointments_router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(prediction_router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(recommendations_router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(websocket_router, prefix="/ws", tags=["WebSocket"])

