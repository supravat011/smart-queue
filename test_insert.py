from backend.db.database import SessionLocal, engine
from backend.db.models import Slot, Service
from datetime import date
import sys
import logging

# Suppress logs
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

db = SessionLocal()
print(f"DB URL: {engine.url}")

try:
    # Check services
    service = db.query(Service).first()
    if not service:
        print("No services found!")
        sys.exit(1)
        
    print(f"Using Service: {service.id} - {service.name}")
    
    # Try insert
    slot = Slot(
        service_id=service.id,
        date=date.today(),
        start_time="12:00",
        end_time="12:30",
        capacity=5,
        status="AVAILABLE"
    )
    db.add(slot)
    db.commit()
    print("Committed slot.")
    
    # Verify
    count = db.query(Slot).count()
    print(f"Slot count after commit: {count}")
    
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
