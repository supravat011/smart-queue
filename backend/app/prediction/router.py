from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.app.prediction.schemas import PredictionResponse, PeakHourAnalysis
from backend.app.prediction.service import PredictionService
from backend.app.auth.dependencies import get_current_user
from backend.db.models import User

router = APIRouter()

@router.get("/slot/{slot_id}", response_model=PredictionResponse)
async def get_slot_prediction(
    slot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get prediction for a specific slot."""
    return PredictionService.get_slot_prediction(db, slot_id)

@router.get("/peak-hours", response_model=list[PeakHourAnalysis])
async def get_peak_hours(
    service_id: int = Query(..., description="Service ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get peak hour analysis for a service."""
    return PredictionService.get_peak_hours(db, service_id)
