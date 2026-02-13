from backend.db.database import SessionLocal
from backend.db.models import Slot, Service
from datetime import datetime, timedelta, time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def force_create_slots():
    db = SessionLocal()
    try:
        # 1. Clear existing slots
        deleted = db.query(Slot).delete()
        db.commit()
        print(f"Deleted {deleted} existing slots.")

        # 2. Get services
        services = db.query(Service).all()
        print(f"Found {len(services)} services.")
        
        if not services:
            print("ERROR: No services found! Cannot create slots.")
            return

        # 3. Create slots
        today = datetime.now().date()
        time_slots = [
            (time(9, 0), time(9, 30)), (time(9, 30), time(10, 0)), (time(10, 0), time(10, 30)),
            (time(10, 30), time(11, 0)), (time(11, 0), time(11, 30)), (time(11, 30), time(12, 0)),
            (time(14, 0), time(14, 30)), (time(14, 30), time(15, 0)), (time(15, 0), time(15, 30)),
            (time(15, 30), time(16, 0)), (time(16, 0), time(16, 30)), (time(16, 30), time(17, 0)),
        ]

        total_created = 0
        for service in services:
            print(f"Creating slots for Service: {service.name}")
            for day_offset in range(7):
                slot_date = today + timedelta(days=day_offset)
                for start, end in time_slots:
                    slot = Slot(
                        service_id=service.id,
                        date=slot_date,
                        start_time=start,
                        end_time=end,
                        capacity=10,
                        status="AVAILABLE"
                    )
                    db.add(slot)
                    total_created += 1
        
        db.commit()
        print(f"SUCCESS: Created {total_created} slots in total.")
        
        # Verify
        count = db.query(Slot).count()
        print(f"VERIFICATION: Total slots in DB is now: {count}")

    except Exception as e:
        print(f"ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    force_create_slots()
