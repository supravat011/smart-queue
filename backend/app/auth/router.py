from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.app.auth.schemas import UserCreate, UserLogin, UserResponse, Token
from backend.app.auth.service import AuthService
from backend.app.auth.dependencies import get_current_user
from backend.db.models import User

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    user = AuthService.register_user(db, user_data)
    return user

@router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access tokens with user info."""
    user = AuthService.authenticate_user(db, login_data)
    tokens = AuthService.create_tokens(user)
    
    # Return tokens along with user info
    return {
        **tokens,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "priority_weight": user.priority_weight,
            "status": user.status
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return current_user

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Refresh access token."""
    tokens = AuthService.create_tokens(current_user)
    return tokens
