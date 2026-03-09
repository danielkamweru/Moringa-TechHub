from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database.connection import engine, test_connection
from app.database.models import Base
from app.routes import auth, users, content, comments, categories, notifications, wishlist, admin_enhanced, keep_alive
import logging
import os
import asyncio

# Import seed function
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from seed_final import seed_database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Moringa TechHub API", version="1.0.0")

# Add middleware to handle OPTIONS requests before route processing
@app.middleware("http")
async def handle_options_requests(request: Request, call_next):
    if request.method == "OPTIONS":
        return {"message": "OK"}
    response = await call_next(request)
    return response

# Configure CORS middleware - MUST be added right after app creation
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://moringa-tech-hub-kappa.vercel.app",
        "http://localhost:5173",
        "http://localhost:8000", 
        "http://localhost:3000",
        "https://moringa-techhub.onrender.com"  # Add production URL for direct API access
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create database tables with error handling
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Moringa TechHub API...")
    
    # Test database connection with retry
    db_connected = test_connection()
    
    if db_connected:
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")
            
            # Seed database if requested
            if os.getenv("SEED_ON_START", "false").lower() == "true":
                logger.info("Seeding database on startup...")
                try:
                    seed_database()
                    logger.info("Database seeded successfully")
                except Exception as e:
                    logger.error(f"Database seeding failed: {e}")
                    
        except Exception as e:
            logger.error(f"Database setup failed: {e}")
    else:
        logger.warning("Database connection failed - API will start but database operations may fail")

# Include routers
try:
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
except Exception as e:
    print(f" Auth router error: {e}")

try:
    app.include_router(users.router, prefix="/api/users", tags=["Users"])
except Exception as e:
    print(f"Users router error: {e}")

try:
    app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
except Exception as e:
    print(f" Comments router error: {e}")

try:
    app.include_router(content.router, prefix="/api/content", tags=["Content"])
except Exception as e:
    print(f"Content router error: {e}")

try:
    app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
except Exception as e:
    print(f" Categories router error: {e}")
    import traceback
    traceback.print_exc()


try:
    app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
except Exception as e:
    print(f" Notifications router error: {e}")

try:
    app.include_router(wishlist.router, prefix="/api/wishlist", tags=["Wishlist"])
except Exception as e:
    print(f"Wishlist router error: {e}")

try:
    app.include_router(admin_enhanced.router, prefix="/api/admin", tags=["Admin"])
except Exception as e:
    print(f" Admin router error: {e}")

try:
    app.include_router(keep_alive.router, prefix="/api", tags=["Keep-Alive"])
except Exception as e:
    print(f"Keep-alive router error: {e}")

# Serve static files (uploaded images)
# Use persistent storage on Render, local storage for development
if os.getenv("PERSISTENT_STORAGE"):
    uploads_path = os.getenv("PERSISTENT_STORAGE")
else:
    uploads_path = os.path.join(os.path.dirname(__file__), "..", "uploads")
if os.path.exists(uploads_path):
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")
    # Also serve avatars directly
    avatars_path = os.path.join(uploads_path, "avatars")
    if os.path.exists(avatars_path):
        app.mount("/avatars", StaticFiles(directory=avatars_path), name="avatars")

@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "OK"}

# @app.middleware("http")
# async def add_no_cache_headers(request, call_next):
#     response = await call_next(request)
#     response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
#     response.headers["Pragma"] = "no-cache"
#     response.headers["Expires"] = "0"
#     return response

# Add global OPTIONS handler for CORS preflight
@app.options("/{path:path}")
async def options_handler(request: Request, path: str):
    return {"message": "OK"}

@app.get("/")
async def root():
    return {"message": "Welcome to Moringa TechHub API", "version": "1.1.4", "deployed": "2025-03-09-18:15", "status": "DATABASE_ENABLED_CATEGORIES"}

@app.get("/health")
async def health_check():
    # Quick health check that doesn't wait for database
    return {"status": "starting", "database": "checking", "version": "1.0.1"}

@app.get("/ready")
async def readiness_check():
    # Full readiness check with database
    try:
        db_status = test_connection()
        return {"status": "ready", "database": "connected" if db_status else "disconnected", "version": "1.0.1"}
    except Exception as e:
        return {"status": "not_ready", "database": "disconnected", "error": str(e)}

@app.get("/debug")
async def debug_routes():
    return {
        "message": "Debug endpoint",
        "routes": [route.path for route in app.routes],
        "categories_router": "categories router should be included"
    }

@app.get("/debug/env")
async def debug_env():
    """Debug endpoint to check environment variables (without exposing sensitive data)"""
    from app.database.connection import DATABASE_URL as db_url
    
    if db_url and "@" in db_url:
        # Hide credentials in the URL
        parts = db_url.split("@")
        if len(parts) >= 2:
            safe_url = f"postgresql://***:***@{parts[1]}"
        else:
            safe_url = "Invalid format"
    else:
        safe_url = db_url
    
    return {
        "database_url_configured": bool(os.getenv("DATABASE_URL")),
        "database_url_safe": safe_url,
        "database_url_length": len(db_url) if db_url else 0,
        "environment": os.getenv("ENVIRONMENT", "development"),
        "seed_on_start": os.getenv("SEED_ON_START", "false"),
        "persistent_storage": os.getenv("PERSISTENT_STORAGE", "Not set"),
        "database_type": "SQLite" if db_url.startswith("sqlite") else "PostgreSQL"
    }

@app.post("/seed")
async def manual_seed():
    """Manual endpoint to seed the database"""
    try:
        seed_database()
        return {"message": "Database seeded successfully", "status": "success"}
    except Exception as e:
        logger.error(f"Manual seeding failed: {e}")
        return {"message": f"Seeding failed: {str(e)}", "status": "error"}

if __name__ == "__main__":
    import uvicorn
    print("Starting Moringa TechHub Backend...")
    print(" Available on: http://localhost:8000")
    print(" Frontend should connect to: http://localhost:5173")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
        log_level="info"
    )