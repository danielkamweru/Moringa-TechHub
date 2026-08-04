from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Clean the DATABASE_URL of any whitespace/newlines
raw_url = os.getenv("DATABASE_URL", "").strip().replace("\n", "").replace("\r", "")

if not raw_url:
    raise ValueError("DATABASE_URL environment variable is not set")

# Strip any existing sslmode param then re-add it cleanly
if "?sslmode=" in raw_url:
    raw_url = raw_url.split("?sslmode=")[0]
if raw_url.endswith("?"):
    raw_url = raw_url[:-1]

DATABASE_URL = raw_url + "?sslmode=require"

logger.info(f"Connecting to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'unknown'}")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"connect_timeout": 30}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    try:
        with engine.connect() as connection:
            from sqlalchemy import text
            connection.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
