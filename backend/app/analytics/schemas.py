from pydantic import BaseModel
from datetime import date

class AnalyticsOverview(BaseModel):
    total_bookings: int
    total_cancellations: int
    average_utilization: float
    peak_day: str
    busiest_service: str

class ServicePerformance(BaseModel):
    service_id: int
    service_name: str
    total_bookings: int
    average_wait_time: float
    utilization_rate: float
    cancellation_rate: float

class DailyStats(BaseModel):
    date: date
    total_bookings: int
    total_slots: int
    utilization_percentage: float
    average_wait_time: float
