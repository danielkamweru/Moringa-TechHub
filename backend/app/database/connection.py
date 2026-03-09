from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

# Force override any external DATABASE_URL with Render internal format
if DATABASE_URL and DATABASE_URL.startswith("postgresql://") and "dpg-" in DATABASE_URL:
    logger.warning("External DATABASE_URL detected, forcing Render internal format")
    # Use Render's internal database connection format
    DATABASE_URL = "postgresql://moringa_user:@localhost:5432/moringa_techhub?sslmode=require"

# Validate DATABASE_URL is properly configured
if not DATABASE_URL or DATABASE_URL == "postgresql://username:password@localhost:5432/moringa_techhub":
    raise ValueError("DATABASE_URL must be properly configured in Render dashboard")

# Add SSL configuration for production PostgreSQL
if "render.com" in DATABASE_URL and "?sslmode=" not in DATABASE_URL:
    DATABASE_URL += "?sslmode=require"

logger.info(f"Using PostgreSQL database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'unknown'}")

# Create PostgreSQL engine
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "connect_timeout": 10,
    }
)
logger.info("PostgreSQL engine created successfully")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """Test database connection with retry logic"""
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            with engine.connect() as connection:
                from sqlalchemy import text
                connection.execute(text("SELECT 1"))
                logger.info("Database connection successful")
                return True
        except Exception as e:
            error_msg = str(e).lower()
            if "name or service not known" in error_msg or "could not translate host name" in error_msg:
                logger.error(f"DNS resolution failed - DATABASE_URL may be incorrect: {e}")
                return False
            elif "connection" in error_msg and "refused" in error_msg:
                logger.warning(f"Connection refused - database may be starting: {e}")
            else:
                logger.warning(f"Database connection attempt {attempt + 1} failed: {e}")
            
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                logger.error("Failed to connect to database after all retries")
                return False
    return False