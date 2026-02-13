from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.db.models import Appointment, Slot, Service, User
from backend.app.appointments.schemas import AppointmentCreate, QueueStatus
from backend.app.slots.service import SlotService
import secrets
import string

class AppointmentService:
    """Service for appointment booking operations."""
    
    @staticmethod
    def generate_booking_reference() -> str:
        """Generate a unique booking reference."""
        chars = string.ascii_uppercase + string.digits
        return 'SQ-' + ''.join(secrets.choice(chars) for _ in range(8))
    
    @staticmethod
    def book_appointment(
        db: Session,
        user_id: int,
        appointment_data: AppointmentCreate
    ) -> Appointment:
        """Book an appointment with atomic transaction."""
        # Start transaction
        try:
            # Get slot and lock it for update
            slot = db.query(Slot).filter(Slot.id == appointment_data.slot_id).with_for_update().first()
            
            if not slot:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Slot not found"
                )
            
            # Check if slot is full
            if slot.booked_count >= slot.capacity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Slot is full"
                )
            
            # Verify service
            service = db.query(Service).filter(Service.id == appointment_data.service_id).first()
            if not service:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Service not found"
                )
            
            # Get user for priority
            user = db.query(User).filter(User.id == user_id).first()
            
            # Calculate queue position based on priority
            existing_appointments = db.query(Appointment).filter(
                Appointment.slot_id == slot.id,
                Appointment.status == "CONFIRMED"
            ).order_by(Appointment.queue_position).all()
            
            # Priority-based insertion
            if user.priority_weight > 1:  # VIP or SENIOR
                # Insert before regular users
                queue_position = 1
                for apt in existing_appointments:
                    apt_user = db.query(User).filter(User.id == apt.user_id).first()
                    if apt_user.priority_weight < user.priority_weight:
                        break
                    queue_position += 1
                
                # Update positions of appointments after this one
                for apt in existing_appointments[queue_position-1:]:
                    apt.queue_position += 1
            else:
                # Regular user - add to end
                queue_position = len(existing_appointments) + 1
            
            # Calculate estimated wait time
            estimated_wait = (queue_position - 1) * service.avg_duration_minutes
            
            # Create appointment
            booking_ref = AppointmentService.generate_booking_reference()
            new_appointment = Appointment(
                user_id=user_id,
                slot_id=slot.id,
                service_id=service.id,
                booking_reference=booking_ref,
                queue_position=queue_position,
                estimated_wait_minutes=estimated_wait,
                status="CONFIRMED"
            )
            
            # Update slot booked count
            slot.booked_count += 1
            
            # Update slot status
            SlotService.update_slot_status(db, slot)
            
            db.add(new_appointment)
            db.commit()
            db.refresh(new_appointment)
            
            # Broadcast real-time updates
            from backend.app.websocket.manager import manager
            import asyncio
            
            # Notify slot update
            asyncio.create_task(manager.broadcast_slot_update(
                slot.id,
                {
                    "capacity": slot.capacity,
                    "booked_count": slot.booked_count,
                    "status": slot.status
                }
            ))
            
            # Notify user
            asyncio.create_task(manager.notify_appointment_update(
                user_id,
                new_appointment.id,
                "CONFIRMED",
                queue_position
            ))
            
            return new_appointment
            
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Booking failed: {str(e)}"
            )
    
    @staticmethod
    def get_appointment_by_id(db: Session, appointment_id: int) -> Appointment:
        """Get appointment by ID."""
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        return appointment
    
    @staticmethod
    def get_user_appointments(db: Session, user_id: int) -> list[Appointment]:
        """Get all appointments for a user."""
        return db.query(Appointment).filter(
            Appointment.user_id == user_id
        ).order_by(Appointment.created_at.desc()).all()
    
    @staticmethod
    def cancel_appointment(db: Session, appointment_id: int, user_id: int) -> None:
        """Cancel an appointment."""
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        
        # Verify ownership
        if appointment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this appointment"
            )
        
        if appointment.status != "CONFIRMED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Appointment cannot be cancelled"
            )
        
        # Update appointment status
        appointment.status = "CANCELLED"
        from datetime import datetime
        appointment.cancelled_at = datetime.utcnow()
        
        # Update slot booked count
        slot = db.query(Slot).filter(Slot.id == appointment.slot_id).first()
        if slot:
            slot.booked_count = max(0, slot.booked_count - 1)
            SlotService.update_slot_status(db, slot)
        
        # Recalculate queue positions
        remaining_appointments = db.query(Appointment).filter(
            Appointment.slot_id == appointment.slot_id,
            Appointment.status == "CONFIRMED",
            Appointment.queue_position > appointment.queue_position
        ).all()
        
        for apt in remaining_appointments:
            apt.queue_position -= 1
        
        db.commit()
        
        # Broadcast updates
        from backend.app.websocket.manager import manager
        import asyncio
        
        # Notify slot update
        if slot:
            asyncio.create_task(manager.broadcast_slot_update(
                slot.id,
                {
                    "capacity": slot.capacity,
                    "booked_count": slot.booked_count,
                    "status": slot.status
                }
            ))
        
        # Notify affected users about queue position changes
        for apt in remaining_appointments:
            asyncio.create_task(manager.notify_appointment_update(
                apt.user_id,
                apt.id,
                "CONFIRMED",
                apt.queue_position
            ))
    
    @staticmethod
    def get_queue_status(db: Session, appointment_id: int) -> QueueStatus:
        """Get current queue status for an appointment."""
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        
        total_in_queue = db.query(Appointment).filter(
            Appointment.slot_id == appointment.slot_id,
            Appointment.status == "CONFIRMED"
        ).count()
        
        return QueueStatus(
            appointment_id=appointment.id,
            booking_reference=appointment.booking_reference,
            queue_position=appointment.queue_position or 0,
            total_in_queue=total_in_queue,
            estimated_wait_minutes=appointment.estimated_wait_minutes or 0,
            status=appointment.status
        )
