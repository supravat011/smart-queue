from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.db.models import Service
from backend.app.services.schemas import ServiceCreate, ServiceUpdate

class ServiceService:
    """Service for service management operations."""
    
    @staticmethod
    def create_service(db: Session, service_data: ServiceCreate) -> Service:
        """Create a new service."""
        new_service = Service(**service_data.model_dump())
        db.add(new_service)
        db.commit()
        db.refresh(new_service)
        return new_service
    
    @staticmethod
    def get_service_by_id(db: Session, service_id: int) -> Service:
        """Get service by ID."""
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        return service
    
    @staticmethod
    def get_services(db: Session, active_only: bool = True) -> list[Service]:
        """Get list of services."""
        query = db.query(Service)
        if active_only:
            query = query.filter(Service.is_active == True)
        return query.all()
    
    @staticmethod
    def update_service(db: Session, service_id: int, service_data: ServiceUpdate) -> Service:
        """Update service."""
        service = ServiceService.get_service_by_id(db, service_id)
        update_data = service_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(service, field, value)
        db.commit()
        db.refresh(service)
        return service
    
    @staticmethod
    def delete_service(db: Session, service_id: int) -> None:
        """Soft delete service."""
        service = ServiceService.get_service_by_id(db, service_id)
        service.is_active = False
        db.commit()
