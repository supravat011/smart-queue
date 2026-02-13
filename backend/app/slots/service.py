from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.db.models import Slot, Service
from backend.app.slots.schemas import SlotCreate, SlotUpdate, SlotAvailability
from datetime import date

class SlotService:
    """Service for slot management operations."""
    
    @staticmethod
    def create_slot(db: Session, slot_data: SlotCreate, created_by: int) -> Slot:
        """Create a new slot."""
        # Verify service exists
        service = db.query(Service).filter(Service.id == slot_data.service_id).first()
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        new_slot = Slot(
            **slot_data.model_dump(),
            created_by=created_by
        )
        db.add(new_slot)
        db.commit()
        db.refresh(new_slot)
        return new_slot
    
    @staticmethod
    def get_slot_by_id(db: Session, slot_id: int) -> Slot:
        """Get slot by ID."""
        slot = db.query(Slot).filter(Slot.id == slot_id).first()
        if not slot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Slot not found"
            )
        return slot
    
    @staticmethod
    def get_slots(
        db: Session,
        service_id: int = None,
        slot_date: date = None,
        status: str = None
    ) -> list[Slot]:
        """Get list of slots with filters."""
        query = db.query(Slot)
        
        if service_id:
            query = query.filter(Slot.service_id == service_id)
        if slot_date:
            query = query.filter(Slot.date == slot_date)
        if status:
            query = query.filter(Slot.status == status)
        
        return query.order_by(Slot.date, Slot.start_time).all()
    
    @staticmethod
    def update_slot(db: Session, slot_id: int, slot_data: SlotUpdate) -> Slot:
        """Update slot."""
        slot = SlotService.get_slot_by_id(db, slot_id)
        update_data = slot_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(slot, field, value)
        db.commit()
        db.refresh(slot)
        return slot
    
    @staticmethod
    def update_slot_status(db: Session, slot: Slot) -> None:
        """Update slot status based on capacity."""
        load_percentage = (slot.booked_count / slot.capacity) * 100
        
        if load_percentage >= 100:
            slot.status = "FULL"
        elif load_percentage >= 70:
            slot.status = "CROWDED"
        else:
            slot.status = "AVAILABLE"
        
        db.commit()
    
    @staticmethod
    def get_slot_availability(db: Session, slot_id: int) -> SlotAvailability:
        """Get detailed slot availability information."""
        slot = SlotService.get_slot_by_id(db, slot_id)
        
        available_count = slot.capacity - slot.booked_count
        load_percentage = (slot.booked_count / slot.capacity) * 100
        
        # Determine congestion level
        if load_percentage >= 70:
            congestion_level = "HIGH"
        elif load_percentage >= 40:
            congestion_level = "MEDIUM"
        else:
            congestion_level = "LOW"
        
        return SlotAvailability(
            slot_id=slot.id,
            capacity=slot.capacity,
            booked_count=slot.booked_count,
            available_count=available_count,
            status=slot.status,
            is_available=available_count > 0,
            congestion_level=congestion_level
        )
    
    @staticmethod
    def bulk_create_slots(
        db: Session,
        service_id: int,
        start_date: date,
        end_date: date,
        time_slots: list[tuple],  # [(start_time, end_time), ...]
        capacity: int,
        created_by: int
    ) -> list[Slot]:
        """Bulk create slots for a date range."""
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        
        slots = []
        current_date = start_date
        
        while current_date <= end_date:
            for start_time, end_time in time_slots:
                slot = Slot(
                    service_id=service_id,
                    date=current_date,
                    start_time=start_time,
                    end_time=end_time,
                    capacity=capacity,
                    created_by=created_by
                )
                slots.append(slot)
            
            # Move to next day
            from datetime import timedelta
            current_date += timedelta(days=1)
        
        db.add_all(slots)
        db.commit()
        
        return slots
