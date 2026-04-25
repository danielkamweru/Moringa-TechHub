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
    DATABASE_URL = render_db_url.replace("\n", "").replace(
        "\r", ""
    )  # Remove any newlines
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
if (
    not DATABASE_URL
    or DATABASE_URL == "postgresql://username:password@localhost:5432/moringa_techhub"
):
    raise ValueError("DATABASE_URL must be properly configured in Render dashboard")

# SSL configuration will be handled in engine connect_args only

logger.info(
    f"Using PostgreSQL database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'unknown'}"
)

# Create PostgreSQL engine using Render's exact connection format
# Use the DATABASE_URL exactly as provided by Render
original_db_url = os.getenv("DATABASE_URL", "").strip()
if original_db_url:
    # Use the exact DATABASE_URL from Render without modifications
    DATABASE_URL = original_db_url.replace("\n", "").replace("\r", "")
    logger.info(f"Using original Render DATABASE_URL: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'unknown'}")

# Create engine with minimal configuration to let Render handle SSL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "connect_timeout": 20,
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
    """Test database connection with psycopg2 directly"""
    try:
        import psycopg2

        # Test direct psycopg2 connection first
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        logger.info("Direct psycopg2 connection successful")

        # Now test SQLAlchemy connection
        with engine.connect() as connection:
            from sqlalchemy import text

            connection.execute(text("SELECT 1"))
            logger.info("SQLAlchemy connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
