from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SmartQueue_Labs"
    APP_VERSION: str = "2.4.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/smartqueue"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    FRONTEND_URL: Optional[str] = None
    
    @property
    def ALLOWED_ORIGINS(self) -> list:
        origins = ["http://localhost:3000", "http://localhost:5173"]
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL)
        return origins
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
