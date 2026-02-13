from sqlalchemy.orm import Session
from sqlalchemy import and_
from backend.db.models import Slot, Service, User
from backend.app.recommendations.schemas import SlotRecommendation
from backend.app.prediction.algorithms import PredictionAlgorithms
from datetime import date, time as dt_time, datetime, timedelta
from typing import List, Tuple

class RecommendationService:
    """Service for generating smart slot recommendations."""
    
    @staticmethod
    def calculate_slot_score(
        slot: Slot,
        user_priority: int,
        preferred_date: date = None,
        preferred_time_range: Tuple[dt_time, dt_time] = None,
        max_wait_minutes: int = None,
        db: Session = None
    ) -> Tuple[float, List[str]]:
        """
        Calculate recommendation score for a slot.
        Returns: (score, reasons)
        """
        score = 1.0
        reasons = []
        
        # Factor 1: Availability (40% weight)
        availability_ratio = (slot.capacity - slot.booked_count) / slot.capacity
        availability_score = availability_ratio * 0.4
        score = availability_score
        
        if availability_ratio > 0.7:
            reasons.append("High availability")
        elif availability_ratio > 0.3:
            reasons.append("Moderate availability")
        else:
            reasons.append("Limited availability")
        
        # Factor 2: Congestion (30% weight)
        congestion = PredictionAlgorithms.calculate_congestion_score(
            slot.booked_count, slot.capacity
        )
        congestion_score = (1 - congestion) * 0.3
        score += congestion_score
        
        if congestion < 0.4:
            reasons.append("Low congestion expected")
        elif congestion < 0.7:
            reasons.append("Moderate traffic")
        
        # Factor 3: Date preference (15% weight)
        if preferred_date:
            days_diff = abs((slot.date - preferred_date).days)
            if days_diff == 0:
                date_score = 0.15
                reasons.append("Matches preferred date")
            elif days_diff <= 2:
                date_score = 0.10
                reasons.append("Close to preferred date")
            else:
                date_score = 0.05
        else:
            date_score = 0.10
        score += date_score
        
        # Factor 4: Time preference (15% weight)
        if preferred_time_range:
            pref_start, pref_end = preferred_time_range
            if pref_start <= slot.start_time <= pref_end:
                time_score = 0.15
                reasons.append("Matches preferred time")
            else:
                time_score = 0.05
        else:
            time_score = 0.10
        score += time_score
        
        # Bonus: Priority user gets slight boost for less crowded slots
        if user_priority > 1 and availability_ratio > 0.5:
            score += 0.05
            reasons.append("Priority access recommended")
        
        return min(score, 1.0), reasons
    
    @staticmethod
    def get_alternative_slots(
        db: Session,
        slot_id: int,
        user: User,
        limit: int = 5
    ) -> List[SlotRecommendation]:
        """Get alternative slot recommendations when preferred slot is full/crowded."""
        original_slot = db.query(Slot).filter(Slot.id == slot_id).first()
        if not original_slot:
            return []
        
        # Find similar slots (same service, nearby dates)
        date_range_start = original_slot.date - timedelta(days=3)
        date_range_end = original_slot.date + timedelta(days=7)
        
        alternative_slots = db.query(Slot).filter(
            and_(
                Slot.service_id == original_slot.service_id,
                Slot.date >= date_range_start,
                Slot.date <= date_range_end,
                Slot.id != slot_id,
                Slot.booked_count < Slot.capacity  # Only available slots
            )
        ).all()
        
        # Score and rank alternatives
        recommendations = []
        for slot in alternative_slots:
            score, reasons = RecommendationService.calculate_slot_score(
                slot=slot,
                user_priority=user.priority_weight,
                preferred_date=original_slot.date,
                preferred_time_range=(original_slot.start_time, original_slot.end_time),
                db=db
            )
            
            # Get congestion level
            congestion = PredictionAlgorithms.calculate_congestion_score(
                slot.booked_count, slot.capacity
            )
            if congestion < 0.4:
                congestion_level = "LOW"
            elif congestion < 0.7:
                congestion_level = "MEDIUM"
            else:
                congestion_level = "HIGH"
            
            # Estimate wait time
            service = db.query(Service).filter(Service.id == slot.service_id).first()
            avg_duration = service.avg_duration_minutes if service else 15
            estimated_wait = int(slot.booked_count * avg_duration * (1 + congestion * 0.3))
            
            recommendations.append(SlotRecommendation(
                slot_id=slot.id,
                date=slot.date,
                start_time=slot.start_time,
                end_time=slot.end_time,
                capacity=slot.capacity,
                booked_count=slot.booked_count,
                score=score,
                reasons=reasons,
                congestion_level=congestion_level,
                estimated_wait_minutes=estimated_wait
            ))
        
        # Sort by score (highest first) and return top N
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
    
    @staticmethod
    def get_best_times(
        db: Session,
        service_id: int,
        user: User,
        target_date: date = None,
        limit: int = 10
    ) -> List[SlotRecommendation]:
        """Get best time slots for a service on a given date."""
        if target_date is None:
            target_date = date.today()
        
        # Get all available slots for the service on the date
        slots = db.query(Slot).filter(
            and_(
                Slot.service_id == service_id,
                Slot.date == target_date,
                Slot.booked_count < Slot.capacity
            )
        ).all()
        
        if not slots:
            # Try next 7 days
            slots = db.query(Slot).filter(
                and_(
                    Slot.service_id == service_id,
                    Slot.date > target_date,
                    Slot.date <= target_date + timedelta(days=7),
                    Slot.booked_count < Slot.capacity
                )
            ).all()
        
        # Score and rank
        recommendations = []
        for slot in slots:
            score, reasons = RecommendationService.calculate_slot_score(
                slot=slot,
                user_priority=user.priority_weight,
                preferred_date=target_date,
                db=db
            )
            
            congestion = PredictionAlgorithms.calculate_congestion_score(
                slot.booked_count, slot.capacity
            )
            congestion_level = "LOW" if congestion < 0.4 else "MEDIUM" if congestion < 0.7 else "HIGH"
            
            service = db.query(Service).filter(Service.id == slot.service_id).first()
            avg_duration = service.avg_duration_minutes if service else 15
            estimated_wait = int(slot.booked_count * avg_duration * (1 + congestion * 0.3))
            
            recommendations.append(SlotRecommendation(
                slot_id=slot.id,
                date=slot.date,
                start_time=slot.start_time,
                end_time=slot.end_time,
                capacity=slot.capacity,
                booked_count=slot.booked_count,
                score=score,
                reasons=reasons,
                congestion_level=congestion_level,
                estimated_wait_minutes=estimated_wait
            ))
        
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
