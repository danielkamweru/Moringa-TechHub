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

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./moringa_techhub.db")

# Validate DATABASE_URL before proceeding
if not DATABASE_URL or DATABASE_URL == "postgresql://username:password@localhost:5432/moringa_techhub":
    logger.warning("DATABASE_URL is not properly configured. Falling back to SQLite.")
    DATABASE_URL = "sqlite:///./moringa_techhub.db"

# Handle SQLite and PostgreSQL differently
if DATABASE_URL.startswith("sqlite"):
    logger.info("Using SQLite database")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    logger.info(f"Using PostgreSQL database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'unknown'}")
    
    # Add SSL configuration for production PostgreSQL
    if "render.com" in DATABASE_URL and "?sslmode=" not in DATABASE_URL:
        DATABASE_URL += "?sslmode=require"
    
    try:
        # For psycopg2, SSL should be in the URL, not in connect_args
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
    except Exception as e:
        logger.error(f"Failed to create PostgreSQL engine: {e}")
        logger.info("Falling back to SQLite database")
        DATABASE_URL = "sqlite:///./moringa_techhub.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

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
                connection.execute("SELECT 1")
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