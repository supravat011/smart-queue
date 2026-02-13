from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from db.database import get_db
from app.appointments.schemas import (
    AppointmentCreate,
    AppointmentResponse,
    QueueStatus
)
from app.appointments.service import AppointmentService
from app.auth.dependencies import get_current_user
from db.models import User

router = APIRouter()

@router.post("/book", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Book a new appointment."""
    return AppointmentService.book_appointment(db, current_user.id, appointment_data)

@router.get("/my-bookings", response_model=list[AppointmentResponse])
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for current user."""
    return AppointmentService.get_user_appointments(db, current_user.id)

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get appointment by ID."""
    return AppointmentService.get_appointment_by_id(db, appointment_id)

@router.put("/{appointment_id}/cancel", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel an appointment."""
    AppointmentService.cancel_appointment(db, appointment_id, current_user.id)
    return None

@router.get("/{appointment_id}/queue-status", response_model=QueueStatus)
async def get_queue_status(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current queue status for an appointment."""
    return AppointmentService.get_queue_status(db, appointment_id)
