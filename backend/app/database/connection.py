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

# Force override - ignore any external DATABASE_URL and use internal connection
logger.info(f"Original DATABASE_URL: {DATABASE_URL}")

# Get the actual Render database connection from environment
render_db_url = os.getenv("DATABASE_URL", "").strip()  # Strip whitespace and newlines
if render_db_url and "postgresql://" in render_db_url:
    # Use the DATABASE_URL as-is, but remove any SSL parameters to avoid conflicts
    DATABASE_URL = render_db_url.replace("\n", "").replace("\r", "")  # Remove any newlines
    # Remove any existing sslmode parameter completely to avoid conflicts
    if "?sslmode=" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.split("?sslmode=")[0]
    # Also remove any trailing ? if it exists after removing sslmode
    if DATABASE_URL.endswith("?"):
        DATABASE_URL = DATABASE_URL[:-1]
    logger.info(f"Using configured database")
else:
    DATABASE_URL = "postgresql://moringa_user:@localhost:5432/moringa_techhub"
    logger.info("Using fallback localhost database")

logger.info(f"Final DATABASE_URL: {DATABASE_URL}")

# Validate DATABASE_URL is properly configured
if not DATABASE_URL or DATABASE_URL == "postgresql://username:password@localhost:5432/moringa_techhub":
    raise ValueError("DATABASE_URL must be properly configured in Render dashboard")

# SSL configuration will be handled in engine connect_args only

logger.info(f"Using PostgreSQL database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'unknown'}")

# Create PostgreSQL engine with proper SSL configuration
engine = create_engine(
    DATABASE_URL,
    pool_size=10,  # Reduced from 20 to prevent connection exhaustion
    max_overflow=20,  # Reduced from 30
    pool_pre_ping=True,
    pool_recycle=1800,  # Reduced from 3600 to 30 minutes
    connect_args={
        "connect_timeout": 30,  # Increased from 10 to 30 seconds
        "application_name": "moringa_techhub_api",
        "sslmode": "prefer"
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