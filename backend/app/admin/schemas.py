from pydantic import BaseModel
from datetime import date, time

class BulkSlotCreate(BaseModel):
    service_id: int
    start_date: date
    end_date: date
    time_slots: list[tuple[str, str]]  # [(start_time, end_time), ...]
    capacity: int

class SystemMetrics(BaseModel):
    total_users: int
    total_appointments: int
    active_slots: int
    total_services: int
    appointments_today: int
    average_wait_time: float
    system_load: float

class SlotUtilization(BaseModel):
    slot_id: int
    date: date
    time_range: str
    capacity: int
    booked: int
    utilization_percentage: float
    status: str
