from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db.models import Slot, Appointment, Prediction, LoadHistory, Service
from datetime import datetime, timedelta
from typing import List, Tuple

class PredictionAlgorithms:
    """Prediction algorithms for wait time and congestion."""
    
    @staticmethod
    def weighted_moving_average(values: List[float], weights: List[float] = None) -> float:
        """Calculate weighted moving average."""
        if not values:
            return 0.0
        
        if weights is None:
            # Default: more recent values have higher weight
            weights = [i + 1 for i in range(len(values))]
        
        if len(values) != len(weights):
            weights = weights[:len(values)]
        
        weighted_sum = sum(v * w for v, w in zip(values, weights))
        weight_sum = sum(weights)
        
        return weighted_sum / weight_sum if weight_sum > 0 else 0.0
    
    @staticmethod
    def calculate_congestion_score(booked_count: int, capacity: int) -> float:
        """Calculate congestion score (0.0 to 1.0)."""
        if capacity == 0:
            return 1.0
        return min(booked_count / capacity, 1.0)
    
    @staticmethod
    def predict_wait_time(
        db: Session,
        slot_id: int
    ) -> Tuple[int, float, float]:
        """
        Predict wait time for a slot using historical data.
        Returns: (predicted_wait_minutes, congestion_score, confidence_score)
        """
        slot = db.query(Slot).filter(Slot.id == slot_id).first()
        if not slot:
            return 0, 0.0, 0.0
        
        service = db.query(Service).filter(Service.id == slot.service_id).first()
        avg_duration = service.avg_duration_minutes if service else 15
        
        # Get historical load data for similar slots
        similar_slots = db.query(LoadHistory).join(Slot).filter(
            Slot.service_id == slot.service_id,
            Slot.start_time == slot.start_time,
            LoadHistory.timestamp >= datetime.utcnow() - timedelta(days=30)
        ).order_by(LoadHistory.timestamp.desc()).limit(10).all()
        
        if similar_slots:
            # Use WMA on historical load percentages
            load_percentages = [h.load_percentage for h in similar_slots]
            predicted_load = PredictionAlgorithms.weighted_moving_average(load_percentages)
            confidence = min(len(similar_slots) / 10.0, 1.0)  # More data = higher confidence
        else:
            # No historical data, use current load
            predicted_load = (slot.booked_count / slot.capacity * 100) if slot.capacity > 0 else 0
            confidence = 0.5
        
        # Calculate congestion score
        congestion = predicted_load / 100.0
        
        # Estimate wait time based on queue
        current_queue = db.query(Appointment).filter(
            Appointment.slot_id == slot_id,
            Appointment.status == "CONFIRMED"
        ).count()
        
        predicted_wait = int(current_queue * avg_duration * (1 + congestion * 0.3))
        
        return predicted_wait, congestion, confidence
    
    @staticmethod
    def analyze_peak_hours(db: Session, service_id: int, days: int = 30) -> List[dict]:
        """Analyze peak hours for a service."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get appointments grouped by hour
        results = db.query(
            func.extract('hour', Slot.start_time).label('hour'),
            func.count(Appointment.id).label('booking_count'),
            func.avg(Slot.booked_count * 100.0 / Slot.capacity).label('avg_load')
        ).join(Appointment, Appointment.slot_id == Slot.id).filter(
            Slot.service_id == service_id,
            Appointment.created_at >= cutoff_date
        ).group_by('hour').all()
        
        peak_hours = []
        for hour, count, avg_load in results:
            if avg_load >= 70:
                congestion = "HIGH"
                recommendation = "Avoid this time if possible"
            elif avg_load >= 40:
                congestion = "MEDIUM"
                recommendation = "Moderate traffic expected"
            else:
                congestion = "LOW"
                recommendation = "Good time to book"
            
            peak_hours.append({
                "hour": int(hour),
                "average_bookings": float(count),
                "congestion_level": congestion,
                "recommendation": recommendation
            })
        
        return sorted(peak_hours, key=lambda x: x['hour'])
