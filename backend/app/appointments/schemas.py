from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AppointmentCreate(BaseModel):
    slot_id: int
    service_id: int

class AppointmentResponse(BaseModel):
    id: int
    user_id: int
    slot_id: int
    service_id: int
    booking_reference: str
    status: str
    queue_position: Optional[int] = None
    estimated_wait_minutes: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AppointmentWithDetails(AppointmentResponse):
    user_name: str
    service_name: str
    slot_date: str
    slot_time: str

class QueueStatus(BaseModel):
    appointment_id: int
    booking_reference: str
    queue_position: int
    total_in_queue: int
    estimated_wait_minutes: int
    status: str
