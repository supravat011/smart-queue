from sqlalchemy.orm import Session
from sqlalchemy import func
from db.models import User, Appointment, Slot, Service
from app.admin.schemas import SystemMetrics, SlotUtilization
from datetime import datetime, date

class AdminService:
    """Service for admin operations."""
    
    @staticmethod
    def get_system_metrics(db: Session) -> SystemMetrics:
        """Get overall system metrics."""
        total_users = db.query(User).filter(User.status == "ACTIVE").count()
        total_appointments = db.query(Appointment).count()
        active_slots = db.query(Slot).filter(
            Slot.date >= date.today()
        ).count()
        total_services = db.query(Service).filter(Service.is_active == True).count()
        
        # Appointments today
        appointments_today = db.query(Appointment).join(Slot).filter(
            Slot.date == date.today(),
            Appointment.status == "CONFIRMED"
        ).count()
        
        # Average wait time
        avg_wait = db.query(func.avg(Appointment.estimated_wait_minutes)).filter(
            Appointment.status == "CONFIRMED"
        ).scalar() or 0.0
        
        # System load (average slot utilization)
        system_load_result = db.query(
            func.avg(Slot.booked_count * 100.0 / Slot.capacity)
        ).filter(
            Slot.date >= date.today()
        ).scalar()
        
        system_load = system_load_result if system_load_result else 0.0
        
        return SystemMetrics(
            total_users=total_users,
            total_appointments=total_appointments,
            active_slots=active_slots,
            total_services=total_services,
            appointments_today=appointments_today,
            average_wait_time=float(avg_wait),
            system_load=float(system_load)
        )
    
    @staticmethod
    def get_slot_utilization(
        db: Session,
        start_date: date,
        end_date: date
    ) -> list[SlotUtilization]:
        """Get slot utilization report."""
        slots = db.query(Slot).filter(
            Slot.date >= start_date,
            Slot.date <= end_date
        ).all()
        
        utilization_data = []
        for slot in slots:
            utilization_pct = (slot.booked_count / slot.capacity * 100) if slot.capacity > 0 else 0
            
            utilization_data.append(SlotUtilization(
                slot_id=slot.id,
                date=slot.date,
                time_range=f"{slot.start_time} - {slot.end_time}",
                capacity=slot.capacity,
                booked=slot.booked_count,
                utilization_percentage=utilization_pct,
                status=slot.status
            ))
        
        return utilization_data
