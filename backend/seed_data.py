from sqlalchemy.orm import Session
from app.database.connection import SessionLocal, engine
from app.database.models import Base, User, Category, Content, UserRole, ContentType, ContentStatus
from app.core.auth import get_password_hash
from datetime import datetime

def create_tables():
    Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    try:
        # Create sample users
        admin_user = User(
            email="admin@moringatechhub.com",
            username="admin",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            bio="Platform administrator"
        )
        
        tech_writer = User(
            email="writer@moringatechhub.com",
            username="techwriter",
            full_name="Tech Writer",
            hashed_password=get_password_hash("writer123"),
            role=UserRole.TECH_WRITER,
            bio="Experienced tech writer and developer"
        )
        
        regular_user = User(
            email="user@moringatechhub.com",
            username="regularuser",
            full_name="Regular User",
            hashed_password=get_password_hash("user123"),
            role=UserRole.REGULAR_USER,
            bio="Tech enthusiast and learner"
        )
        
        db.add_all([admin_user, tech_writer, regular_user])
        db.commit()
        
        # Create sample categories
        categories = [
            Category(name="DevOps", description="DevOps practices and tools", color="#FF6B6B", created_by=tech_writer.id),
            Category(name="Frontend", description="Frontend development", color="#4ECDC4", created_by=tech_writer.id),
            Category(name="Backend", description="Backend development", color="#45B7D1", created_by=tech_writer.id),
            Category(name="Fullstack", description="Full-stack development", color="#96CEB4", created_by=tech_writer.id),
            Category(name="Data Science", description="Data science and analytics", color="#FFEAA7", created_by=tech_writer.id),
            Category(name="AI/ML", description="Artificial Intelligence and Machine Learning", color="#DDA0DD", created_by=tech_writer.id),
        ]
        
        db.add_all(categories)
        db.commit()
        
        # Create sample content
        sample_content = [
            Content(
                title="Getting Started with React Hooks",
                content_text="React Hooks revolutionized how we write React components...",
                content_type=ContentType.ARTICLE,
                status=ContentStatus.PUBLISHED,
                author_id=tech_writer.id,
                category_id=categories[1].id,  # Frontend
                published_at=datetime.utcnow()
            ),
            Content(
                title="Docker Best Practices for Developers",
                content_text="Docker has become an essential tool for modern development...",
                content_type=ContentType.ARTICLE,
                status=ContentStatus.PUBLISHED,
                author_id=tech_writer.id,
                category_id=categories[0].id,  # DevOps
                published_at=datetime.utcnow()
            ),
            Content(
                title="Building RESTful APIs with FastAPI",
                content_text="FastAPI is a modern, fast web framework for building APIs...",
                content_type=ContentType.ARTICLE,
                status=ContentStatus.PUBLISHED,
                author_id=tech_writer.id,
                category_id=categories[2].id,  # Backend
                published_at=datetime.utcnow()
            ),
        ]
        
        db.add_all(sample_content)
        db.commit()
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    seed_data()