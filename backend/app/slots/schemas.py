from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

class SlotBase(BaseModel):
    service_id: int
    date: date
    start_time: time
    end_time: time
    capacity: int = 10

class SlotCreate(SlotBase):
    pass

class SlotUpdate(BaseModel):
    capacity: Optional[int] = None
    status: Optional[str] = None

class SlotResponse(SlotBase):
    id: int
    booked_count: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SlotAvailability(BaseModel):
    slot_id: int
    capacity: int
    booked_count: int
    available_count: int
    status: str
    is_available: bool
    congestion_level: str  # LOW, MEDIUM, HIGH
