from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database.connection import engine
from app.database.models import Base
from app.routes import auth, users, content, comments, categories, notifications, wishlist, admin_enhanced
import logging
import os

# Import seed function
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
    logger.error(f"Database connection failed: {e}")
    logger.info("The API will start but database operations will fail until database is properly configured")

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
    return {"message": "Welcome to Moringa TechHub API", "version": "1.1.3", "deployed": "2025-02-06-21:35", "status": "DATABASE_ENABLED_CATEGORIES"}

@app.get("/health")
async def health_check():
    try:
        # Test database connection
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected", "version": "1.0.1"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.get("/debug")
async def debug_routes():
    return {
        "message": "Debug endpoint",
        "routes": [route.path for route in app.routes],
        "categories_router": "categories router should be included"
    }

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