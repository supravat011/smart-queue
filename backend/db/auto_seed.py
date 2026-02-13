"""
Auto-seed utility to populate database with initial data
"""
from sqlalchemy.orm import Session
from db.models import Service, Slot
from datetime import datetime, timedelta

def auto_seed_database(db: Session):
    """
    Automatically seed database with services and slots if they don't exist.
    Called when the first user registers.
    """
    # Check if services already exist
    existing_services = db.query(Service).count()
    if existing_services > 0:
        return  # Already seeded
    
    # Create services
    services_data = [
        {
            "name": "General Consultation",
            "description": "General medical consultation and checkup",
            "avg_duration_minutes": 15,
            "is_active": True
        },
        {
            "name": "Dental Checkup",
            "description": "Routine dental examination and cleaning",
            "avg_duration_minutes": 30,
            "is_active": True
        },
        {
            "name": "Blood Test",
            "description": "Blood sample collection and testing",
            "avg_duration_minutes": 10,
            "is_active": True
        },
        {
            "name": "X-Ray Imaging",
            "description": "X-ray imaging services",
            "avg_duration_minutes": 20,
            "is_active": True
        },
        {
            "name": "Vaccination",
            "description": "Vaccination and immunization services",
            "avg_duration_minutes": 10,
            "is_active": True
        },
        {
            "name": "Physical Therapy",
            "description": "Physical therapy and rehabilitation",
            "avg_duration_minutes": 45,
            "is_active": True
        }
    ]
    
    # Create services
    created_services = []
    for service_data in services_data:
        service = Service(**service_data)
        db.add(service)
        created_services.append(service)
    
    db.commit()
    
    # Refresh to get IDs
    for service in created_services:
        db.refresh(service)
    
    # Create time slots for next 7 days
    today = datetime.now().date()
    time_slots = [
        ("09:00", "09:30"),
        ("09:30", "10:00"),
        ("10:00", "10:30"),
        ("10:30", "11:00"),
        ("11:00", "11:30"),
        ("11:30", "12:00"),
        ("14:00", "14:30"),
        ("14:30", "15:00"),
        ("15:00", "15:30"),
        ("15:30", "16:00"),
        ("16:00", "16:30"),
        ("16:30", "17:00"),
    ]
    
    # Create slots for each service
    for service in created_services:
        for day_offset in range(7):  # Next 7 days
            slot_date = today + timedelta(days=day_offset)
            for start_str, end_str in time_slots:
                slot = Slot(
                    service_id=service.id,
                    date=slot_date,
                    start_time=start_str,
                    end_time=end_str,
                    capacity=10,
                    booked_count=0,
                    status="AVAILABLE"
                )
                db.add(slot)
    
    db.commit()
    print(f"Auto-seeded database: {len(created_services)} services and {len(created_services) * 7 * 12} slots created")
