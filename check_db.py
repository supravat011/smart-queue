from backend.db.database import SessionLocal
from backend.db.models import Slot, Service
import sys

# Suppress sqlalchemy logs by configuring logging
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

db = SessionLocal()
try:
    s_count = db.query(Service).count()
    sl_count = db.query(Slot).count()
    print(f"DEBUG_DB_CHECK: Services={s_count}, Slots={sl_count}")
    
    if sl_count > 0:
        first_slot = db.query(Slot).first()
        print(f"DEBUG_DB_CHECK: First Slot Date={first_slot.date}, ServiceID={first_slot.service_id}")
finally:
    db.close()
