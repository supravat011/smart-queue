"""
Seed script to populate initial data for SmartQueue
"""
from sqlalchemy.orm import Session
from backend.db.database import SessionLocal, engine, Base
from backend.db.models import Service, User, Slot
from backend.core.security import get_password_hash
from datetime import datetime, timedelta, time

def seed_services(db: Session):
    """Create initial services"""
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
    
    # Check if services already exist
    existing_services = db.query(Service).count()
    if existing_services > 0:
        print(f"Services already exist ({existing_services} services found). Skipping seed.")
        return
    
    # Create services
    for service_data in services_data:
        service = Service(**service_data)
        db.add(service)
    
    db.commit()
    print(f"[OK] Created {len(services_data)} services")

def seed_admin_user(db: Session):
    """Create initial admin user"""
    # Check if admin exists
    existing_admin = db.query(User).filter(User.email == "admin@smartqueue.com").first()
    if existing_admin:
        print("Admin user already exists. Skipping.")
        return
    
    admin = User(
        email="admin@smartqueue.com",
        password_hash=get_password_hash("admin123"),
        name="Admin User",
        phone="+1234567890",
        role="ADMIN",
        priority_weight=3,
        status="ACTIVE"
    )
    db.add(admin)
    db.commit()
    print("[OK] Created admin user (email: admin@smartqueue.com, password: admin123)")

def seed_demo_user(db: Session):
    """Create demo user for testing"""
    # Check if demo user exists
    existing_user = db.query(User).filter(User.email == "demo@smartqueue.com").first()
    if existing_user:
        print("Demo user already exists. Skipping.")
        return
    
    user = User(
        email="demo@smartqueue.com",
        password_hash=get_password_hash("demo123"),
        name="Demo User",
        phone="+1234567891",
        role="USER",
        priority_weight=1,
        status="ACTIVE"
    )
    db.add(user)
    db.commit()
    print("[OK] Created demo user (email: demo@smartqueue.com, password: demo123)")

def seed_slots(db: Session):
    """Create time slots for services"""
    # Check if slots already exist
    existing_slots = db.query(Slot).count()
    if existing_slots > 0:
        print(f"Slots already exist ({existing_slots} slots found). Skipping seed.")
        return
    
    # Get all services
    services = db.query(Service).all()
    if not services:
        print("No services found. Please seed services first.")
        return
    
    # Create slots for next 7 days
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
    
    slots_created = 0
    for service in services:
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
                slots_created += 1
    
    db.commit()
    print(f"[OK] Created {slots_created} time slots for {len(services)} services")

def main():
    """Run all seed functions"""
    print("Starting database seeding...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        seed_admin_user(db)
        seed_demo_user(db)
        seed_services(db)
        seed_slots(db)
        print("\n[SUCCESS] Database seeding completed successfully!")
    except Exception as e:
        print(f"\n[ERROR] Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
