from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictionResponse(BaseModel):
    id: int
    slot_id: int
    predicted_wait_minutes: Optional[int]
    congestion_score: Optional[float]
    confidence_score: Optional[float]
    algorithm_version: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PeakHourAnalysis(BaseModel):
    hour: int
    average_bookings: float
    congestion_level: str
    recommendation: str
