from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, Time, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(String, nullable=False, default="USER", index=True)  # USER, VIP, SENIOR, ADMIN
    priority_weight = Column(Integer, default=1)  # 1=USER, 2=SENIOR, 3=VIP
    status = Column(String, default="ACTIVE")  # ACTIVE, SUSPENDED, DELETED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    appointments = relationship("Appointment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    avg_duration_minutes = Column(Integer, default=15)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    slots = relationship("Slot", back_populates="service")
    appointments = relationship("Appointment", back_populates="service")
    counters = relationship("Counter", back_populates="service")


class Slot(Base):
    __tablename__ = "slots"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    capacity = Column(Integer, nullable=False, default=10)
    booked_count = Column(Integer, default=0)
    status = Column(String, default="AVAILABLE", index=True)  # AVAILABLE, CROWDED, FULL
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    service = relationship("Service", back_populates="slots")
    appointments = relationship("Appointment", back_populates="slot")
    load_history = relationship("LoadHistory", back_populates="slot")
    predictions = relationship("Prediction", back_populates="slot")


class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    booking_reference = Column(String, unique=True, nullable=False, index=True)
    status = Column(String, default="CONFIRMED", index=True)  # CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
    queue_position = Column(Integer)
    estimated_wait_minutes = Column(Integer)
    checked_in_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="appointments")
    slot = relationship("Slot", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")


class Counter(Base):
    __tablename__ = "counters"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    current_serving_appointment_id = Column(Integer, ForeignKey("appointments.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    service = relationship("Service", back_populates="counters")


class LoadHistory(Base):
    __tablename__ = "load_history"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    booked_count = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False)
    load_percentage = Column(Float)
    
    # Relationships
    slot = relationship("Slot", back_populates="load_history")


class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False, index=True)
    predicted_wait_minutes = Column(Integer)
    congestion_score = Column(Float)  # 0.0 to 1.0
    confidence_score = Column(Float)  # 0.0 to 1.0
    algorithm_version = Column(String, default="WMA_v1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    slot = relationship("Slot", back_populates="predictions")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    type = Column(String, nullable=False)  # SLOT_FULL, OVERCROWDING, PRIORITY_ALERT, SYSTEM
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    action = Column(String, nullable=False)
    entity_type = Column(String)  # USER, SLOT, APPOINTMENT, etc.
    entity_id = Column(Integer)
    details = Column(Text)
    ip_address = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
