from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from db.database import get_db
from app.users.schemas import UserResponse, UserUpdate, UserListResponse
from app.users.service import UserService
from app.auth.dependencies import get_current_user, require_admin
from db.models import User

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    updated_user = UserService.update_user(db, current_user.id, user_data)
    return updated_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user by ID (Admin only)."""
    user = UserService.get_user_by_id(db, user_id)
    return user

@router.get("/", response_model=UserListResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    role: str = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all users with pagination (Admin only)."""
    users = UserService.get_users(db, skip=skip, limit=limit, role=role)
    total = UserService.get_user_count(db, role=role)
    return UserListResponse(users=users, total=total)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete user (Admin only)."""
    UserService.delete_user(db, user_id)
    return None
