from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.app.services.schemas import ServiceCreate, ServiceUpdate, ServiceResponse
from backend.app.services.service import ServiceService
from backend.app.auth.dependencies import require_admin, get_current_user
from backend.db.models import User

router = APIRouter()

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_data: ServiceCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new service (Admin only)."""
    return ServiceService.create_service(db, service_data)

@router.get("/", response_model=list[ServiceResponse])
async def list_services(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get list of services (public endpoint)."""
    return ServiceService.get_services(db, active_only)

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get service by ID."""
    return ServiceService.get_service_by_id(db, service_id)

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update service (Admin only)."""
    return ServiceService.update_service(db, service_id, service_data)

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete service (Admin only)."""
    ServiceService.delete_service(db, service_id)
    return None
