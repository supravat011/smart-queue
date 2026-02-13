from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    avg_duration_minutes: int = 15

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    avg_duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
