from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.app.slots.schemas import SlotCreate, SlotUpdate, SlotResponse, SlotAvailability
from backend.app.slots.service import SlotService
from backend.app.auth.dependencies import require_admin, get_current_user
from backend.db.models import User
from datetime import date
from typing import Optional

router = APIRouter()

@router.post("/", response_model=SlotResponse, status_code=status.HTTP_201_CREATED)
async def create_slot(
    slot_data: SlotCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new slot (Admin only)."""
    return SlotService.create_slot(db, slot_data, current_user.id)

@router.get("/", response_model=list[SlotResponse])
async def list_slots(
    service_id: Optional[int] = Query(None),
    date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get list of slots with optional filters (public endpoint). Auto-generates slots if none exist for the requested date."""
    
    # If a specific service and date are requested, auto-generate slots if they don't exist
    if service_id and date:
        existing_slots = SlotService.get_slots(db, service_id=service_id, slot_date=date, status=None)
        if not existing_slots:
            # Auto-generate slots for this service and date
            from datetime import time
            from backend.db.models import Slot
            
            time_slots = [
                (time(9, 0), time(9, 30)), (time(9, 30), time(10, 0)), (time(10, 0), time(10, 30)),
                (time(10, 30), time(11, 0)), (time(11, 0), time(11, 30)), (time(11, 30), time(12, 0)),
                (time(14, 0), time(14, 30)), (time(14, 30), time(15, 0)), (time(15, 0), time(15, 30)),
                (time(15, 30), time(16, 0)), (time(16, 0), time(16, 30)), (time(16, 30), time(17, 0)),
            ]
            
            for start, end in time_slots:
                slot = Slot(
                    service_id=service_id,
                    date=date,
                    start_time=start,
                    end_time=end,
                    capacity=10,
                    status="AVAILABLE"
                )
                db.add(slot)
            
            db.commit()
    
    return SlotService.get_slots(db, service_id=service_id, slot_date=date, status=status)

@router.get("/{slot_id}", response_model=SlotResponse)
async def get_slot(
    slot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get slot by ID."""
    return SlotService.get_slot_by_id(db, slot_id)

@router.get("/{slot_id}/availability", response_model=SlotAvailability)
async def get_slot_availability(
    slot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed slot availability information."""
    return SlotService.get_slot_availability(db, slot_id)

@router.put("/{slot_id}", response_model=SlotResponse)
async def update_slot(
    slot_id: int,
    slot_data: SlotUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update slot (Admin only)."""
    return SlotService.update_slot(db, slot_id, slot_data)
