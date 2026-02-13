from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from backend.db.models import Appointment, Slot, Service
from backend.app.analytics.schemas import (
    AnalyticsOverview,
    ServicePerformance,
    DailyStats
)
from datetime import date, timedelta
import csv
import io

class AnalyticsService:
    """Service for analytics and reporting."""
    
    @staticmethod
    def get_analytics_overview(
        db: Session,
        start_date: date,
        end_date: date
    ) -> AnalyticsOverview:
        """Get overall analytics overview for a date range."""
        # Total bookings
        total_bookings = db.query(Appointment).join(Slot).filter(
            and_(
                Slot.date >= start_date,
                Slot.date <= end_date
            )
        ).count()
        
        # Total cancellations
        total_cancellations = db.query(Appointment).join(Slot).filter(
            and_(
                Slot.date >= start_date,
                Slot.date <= end_date,
                Appointment.status == "CANCELLED"
            )
        ).count()
        
        # Average utilization
        avg_util = db.query(
            func.avg(Slot.booked_count * 100.0 / Slot.capacity)
        ).filter(
            and_(
                Slot.date >= start_date,
                Slot.date <= end_date
            )
        ).scalar() or 0.0
        
        # Peak day
        peak_day_result = db.query(
            Slot.date,
            func.count(Appointment.id).label('booking_count')
        ).join(Appointment).filter(
            and_(
                Slot.date >= start_date,
                Slot.date <= end_date
            )
        ).group_by(Slot.date).order_by(func.count(Appointment.id).desc()).first()
        
        peak_day = str(peak_day_result[0]) if peak_day_result else "N/A"
        
        # Busiest service
        busiest_service_result = db.query(
            Service.name,
            func.count(Appointment.id).label('booking_count')
        ).join(Slot).join(Appointment).filter(
            and_(
                Slot.date >= start_date,
                Slot.date <= end_date
            )
        ).group_by(Service.id).order_by(func.count(Appointment.id).desc()).first()
        
        busiest_service = busiest_service_result[0] if busiest_service_result else "N/A"
        
        return AnalyticsOverview(
            total_bookings=total_bookings,
            total_cancellations=total_cancellations,
            average_utilization=float(avg_util),
            peak_day=peak_day,
            busiest_service=busiest_service
        )
    
    @staticmethod
    def get_service_performance(
        db: Session,
        start_date: date,
        end_date: date
    ) -> list[ServicePerformance]:
        """Get performance metrics for each service."""
        services = db.query(Service).filter(Service.is_active == True).all()
        
        performance_data = []
        for service in services:
            # Total bookings
            total_bookings = db.query(Appointment).join(Slot).filter(
                and_(
                    Slot.service_id == service.id,
                    Slot.date >= start_date,
                    Slot.date <= end_date
                )
            ).count()
            
            # Average wait time
            avg_wait = db.query(func.avg(Appointment.estimated_wait_minutes)).join(Slot).filter(
                and_(
                    Slot.service_id == service.id,
                    Slot.date >= start_date,
                    Slot.date <= end_date,
                    Appointment.status == "CONFIRMED"
                )
            ).scalar() or 0.0
            
            # Utilization rate
            util_rate = db.query(
                func.avg(Slot.booked_count * 100.0 / Slot.capacity)
            ).filter(
                and_(
                    Slot.service_id == service.id,
                    Slot.date >= start_date,
                    Slot.date <= end_date
                )
            ).scalar() or 0.0
            
            # Cancellation rate
            total_cancelled = db.query(Appointment).join(Slot).filter(
                and_(
                    Slot.service_id == service.id,
                    Slot.date >= start_date,
                    Slot.date <= end_date,
                    Appointment.status == "CANCELLED"
                )
            ).count()
            
            cancellation_rate = (total_cancelled / total_bookings * 100) if total_bookings > 0 else 0.0
            
            performance_data.append(ServicePerformance(
                service_id=service.id,
                service_name=service.name,
                total_bookings=total_bookings,
                average_wait_time=float(avg_wait),
                utilization_rate=float(util_rate),
                cancellation_rate=float(cancellation_rate)
            ))
        
        return performance_data
    
    @staticmethod
    def get_daily_stats(
        db: Session,
        start_date: date,
        end_date: date
    ) -> list[DailyStats]:
        """Get daily statistics for a date range."""
        daily_stats = []
        current_date = start_date
        
        while current_date <= end_date:
            # Total bookings for the day
            total_bookings = db.query(Appointment).join(Slot).filter(
                Slot.date == current_date
            ).count()
            
            # Total slots for the day
            total_slots = db.query(Slot).filter(Slot.date == current_date).count()
            
            # Utilization percentage
            util_pct = db.query(
                func.avg(Slot.booked_count * 100.0 / Slot.capacity)
            ).filter(Slot.date == current_date).scalar() or 0.0
            
            # Average wait time
            avg_wait = db.query(func.avg(Appointment.estimated_wait_minutes)).join(Slot).filter(
                and_(
                    Slot.date == current_date,
                    Appointment.status == "CONFIRMED"
                )
            ).scalar() or 0.0
            
            daily_stats.append(DailyStats(
                date=current_date,
                total_bookings=total_bookings,
                total_slots=total_slots,
                utilization_percentage=float(util_pct),
                average_wait_time=float(avg_wait)
            ))
            
            current_date += timedelta(days=1)
        
        return daily_stats
    
    @staticmethod
    def export_to_csv(data: list, filename: str = "export.csv") -> str:
        """Export data to CSV format."""
        if not data:
            return ""
        
        output = io.StringIO()
        
        # Get field names from first item
        if hasattr(data[0], 'model_dump'):
            fieldnames = data[0].model_dump().keys()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            for item in data:
                writer.writerow(item.model_dump())
        else:
            # Fallback for dict data
            fieldnames = data[0].keys()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        
        return output.getvalue()
