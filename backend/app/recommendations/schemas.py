from pydantic import BaseModel
from datetime import date, time

class SlotRecommendation(BaseModel):
    slot_id: int
    date: date
    start_time: time
    end_time: time
    capacity: int
    booked_count: int
    score: float  # 0.0 to 1.0, higher is better
    reasons: list[str]
    congestion_level: str
    estimated_wait_minutes: int

class RecommendationRequest(BaseModel):
    service_id: int
    preferred_date: date = None
    preferred_time_range: tuple[str, str] = None  # ("09:00", "12:00")
    max_wait_minutes: int = None
