from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from db.models import User
from app.users.schemas import UserUpdate

class UserService:
    """Service for user management operations."""
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get user by ID."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100, role: str = None) -> list[User]:
        """Get list of users with optional role filter."""
        query = db.query(User)
        
        if role:
            query = query.filter(User.role == role)
        
        users = query.offset(skip).limit(limit).all()
        return users
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UserUpdate) -> User:
        """Update user information."""
        user = UserService.get_user_by_id(db, user_id)
        
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> None:
        """Soft delete user by setting status to DELETED."""
        user = UserService.get_user_by_id(db, user_id)
        user.status = "DELETED"
        db.commit()
    
    @staticmethod
    def get_user_count(db: Session, role: str = None) -> int:
        """Get total count of users."""
        query = db.query(User)
        if role:
            query = query.filter(User.role == role)
        return query.count()
