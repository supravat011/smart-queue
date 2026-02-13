from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: str
    priority_weight: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
