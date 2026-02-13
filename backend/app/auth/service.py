from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from db.models import User
from app.auth.schemas import UserCreate, UserLogin
from core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from datetime import timedelta
from db.auto_seed import auto_seed_database

class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def register_user(db: Session, user_data: UserCreate) -> User:
        """Register a new user."""
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Set priority weight based on role
        priority_weight = 1
        if user_data.role == "SENIOR":
            priority_weight = 2
        elif user_data.role == "VIP":
            priority_weight = 3
        
        # Create new user
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            phone=user_data.phone,
            password_hash=get_password_hash(user_data.password),
            role=user_data.role,
            priority_weight=priority_weight
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Auto-seed database with services and slots if this is the first user
        try:
            auto_seed_database(db)
        except Exception as e:
            print(f"Auto-seed warning: {e}")
            # Don't fail registration if seeding fails
        
        return new_user
    
    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> User:
        """Authenticate user with email and password."""
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if user.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is not active"
            )
        
        return user
    
    @staticmethod
    def create_tokens(user: User) -> dict:
        """Create access and refresh tokens for user."""
        token_data = {
            "sub": user.id,
            "email": user.email,
            "role": user.role
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
