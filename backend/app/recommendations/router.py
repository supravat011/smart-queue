from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.database import get_db
from app.recommendations.schemas import SlotRecommendation
from app.recommendations.service import RecommendationService
from app.auth.dependencies import get_current_user
from db.models import User
from datetime import date

router = APIRouter()

@router.get("/alternative-slots/{slot_id}", response_model=list[SlotRecommendation])
async def get_alternative_slots(
    slot_id: int,
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get alternative slot recommendations when preferred slot is unavailable."""
    return RecommendationService.get_alternative_slots(db, slot_id, current_user, limit)

@router.get("/best-times", response_model=list[SlotRecommendation])
async def get_best_times(
    service_id: int = Query(..., description="Service ID"),
    date: date = Query(None, description="Target date (defaults to today)"),
    limit: int = Query(10, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get best time slots for a service, ranked by multiple factors."""
    return RecommendationService.get_best_times(db, service_id, current_user, date, limit)
