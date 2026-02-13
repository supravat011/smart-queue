from sqlalchemy.orm import Session
from backend.db.models import Prediction, Slot
from backend.app.prediction.algorithms import PredictionAlgorithms
from backend.app.prediction.schemas import PeakHourAnalysis

class PredictionService:
    """Service for prediction operations."""
    
    @staticmethod
    def generate_prediction(db: Session, slot_id: int) -> Prediction:
        """Generate and save prediction for a slot."""
        wait_time, congestion, confidence = PredictionAlgorithms.predict_wait_time(db, slot_id)
        
        prediction = Prediction(
            slot_id=slot_id,
            predicted_wait_minutes=wait_time,
            congestion_score=congestion,
            confidence_score=confidence,
            algorithm_version="WMA_v1"
        )
        
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        
        return prediction
    
    @staticmethod
    def get_slot_prediction(db: Session, slot_id: int) -> Prediction:
        """Get latest prediction for a slot."""
        # Try to get recent prediction (within last hour)
        from datetime import datetime, timedelta
        recent_prediction = db.query(Prediction).filter(
            Prediction.slot_id == slot_id,
            Prediction.created_at >= datetime.utcnow() - timedelta(hours=1)
        ).order_by(Prediction.created_at.desc()).first()
        
        if recent_prediction:
            return recent_prediction
        
        # Generate new prediction if none exists
        return PredictionService.generate_prediction(db, slot_id)
    
    @staticmethod
    def get_peak_hours(db: Session, service_id: int) -> list[PeakHourAnalysis]:
        """Get peak hour analysis for a service."""
        analysis = PredictionAlgorithms.analyze_peak_hours(db, service_id)
        return [PeakHourAnalysis(**item) for item in analysis]
