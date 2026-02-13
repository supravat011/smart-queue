from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.database import get_db
from app.admin.schemas import SystemMetrics, SlotUtilization, BulkSlotCreate
from app.admin.service import AdminService
from app.slots.service import SlotService
from app.auth.dependencies import require_admin
from db.models import User
from datetime import date, time as dt_time

router = APIRouter()

@router.get("/metrics", response_model=SystemMetrics)
async def get_system_metrics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get live system metrics (Admin only)."""
    return AdminService.get_system_metrics(db)

@router.get("/slot-utilization", response_model=list[SlotUtilization])
async def get_slot_utilization(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get slot utilization report (Admin only)."""
    return AdminService.get_slot_utilization(db, start_date, end_date)

@router.post("/slots/bulk-create")
async def bulk_create_slots(
    bulk_data: BulkSlotCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Bulk create slots for a date range (Admin only)."""
    # Convert string times to time objects
    time_slots = []
    for start_str, end_str in bulk_data.time_slots:
        start_time = dt_time.fromisoformat(start_str)
        end_time = dt_time.fromisoformat(end_str)
        time_slots.append((start_time, end_time))
    
    slots = SlotService.bulk_create_slots(
        db=db,
        service_id=bulk_data.service_id,
        start_date=bulk_data.start_date,
        end_date=bulk_data.end_date,
        time_slots=time_slots,
        capacity=bulk_data.capacity,
        created_by=current_user.id
    )
    
    return {"message": f"Created {len(slots)} slots successfully", "count": len(slots)}
