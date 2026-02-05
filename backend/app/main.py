from fastapi import FastAPI
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

# Configure CORS middleware - MUST be added right after app creation
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://moringa-tech-hub-kappa.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
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
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["Wishlist"])
app.include_router(admin_enhanced.router, prefix="/api/admin", tags=["Admin"])

# Serve static files (uploaded images)
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

@app.get("/")
async def root():
    return {"message": "Welcome to Moringa TechHub API", "version": "1.0.8", "deployed": "2025-02-05-22:25", "status": "FIXED_ROUTE_DUPLICATION"}

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
    uvicorn.run(app, host="0.0.0.0", port=8000)