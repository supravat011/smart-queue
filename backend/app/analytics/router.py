from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from db.database import get_db
from app.analytics.schemas import (
    AnalyticsOverview,
    ServicePerformance,
    DailyStats
)
from app.analytics.service import AnalyticsService
from app.auth.dependencies import require_admin
from db.models import User
from datetime import date, timedelta
import io

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    start_date: date = Query(None),
    end_date: date = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get analytics overview (Admin only)."""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    return AnalyticsService.get_analytics_overview(db, start_date, end_date)

@router.get("/service-performance", response_model=list[ServicePerformance])
async def get_service_performance(
    start_date: date = Query(None),
    end_date: date = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get service performance metrics (Admin only)."""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    return AnalyticsService.get_service_performance(db, start_date, end_date)

@router.get("/daily-stats", response_model=list[DailyStats])
async def get_daily_stats(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get daily statistics (Admin only)."""
    return AnalyticsService.get_daily_stats(db, start_date, end_date)

@router.get("/export/service-performance")
async def export_service_performance(
    start_date: date = Query(None),
    end_date: date = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Export service performance to CSV (Admin only)."""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    data = AnalyticsService.get_service_performance(db, start_date, end_date)
    csv_content = AnalyticsService.export_to_csv(data)
    
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=service_performance.csv"}
    )

@router.get("/export/daily-stats")
async def export_daily_stats(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Export daily stats to CSV (Admin only)."""
    data = AnalyticsService.get_daily_stats(db, start_date, end_date)
    csv_content = AnalyticsService.export_to_csv(data)
    
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=daily_stats.csv"}
    )
