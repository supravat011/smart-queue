from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Determine database type
is_mysql = settings.DATABASE_URL.startswith("mysql")
is_postgres = settings.DATABASE_URL.startswith("postgresql")

# Create engine with appropriate settings
if is_mysql or is_postgres:
    # MySQL or PostgreSQL configuration
    engine = create_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,  # Verify connections before using them
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600  # Recycle connections after 1 hour
    )
else:
    raise ValueError(f"Unsupported database URL: {settings.DATABASE_URL}. Only MySQL and PostgreSQL are supported.")

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
