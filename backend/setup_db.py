import os
import subprocess
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from app.database.models import Base
from dotenv import load_dotenv

load_dotenv()

def try_database_configs():
    """Try different database configurations"""
    configs = [
        "postgresql://user:@localhost:5432/moringa_techhub",
        "postgresql://postgres:@localhost:5432/moringa_techhub", 
        "postgresql:///moringa_techhub",
        "postgresql://user:user@localhost:5432/moringa_techhub"
    ]
    
    for config in configs:
        try:
            print(f"Trying: {config}")
            engine = create_engine(config)
            
            # Try to create database if it doesn't exist
            try:
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                print(f"✅ Connected successfully with: {config}")
                return engine, config
            except OperationalError as e:
                if "does not exist" in str(e):
                    # Try to create database
                    db_name = config.split('/')[-1]
                    base_config = config.rsplit('/', 1)[0] + '/postgres'
                    try:
                        base_engine = create_engine(base_config)
                        with base_engine.connect() as conn:
                            conn.execute(text("COMMIT"))
                            conn.execute(text(f"CREATE DATABASE {db_name}"))
                        print(f"✅ Created database and connected with: {config}")
                        return engine, config
                    except:
                        continue
                else:
                    continue
        except Exception as e:
            print(f"❌ Failed: {e}")
            continue
    
    return None, None

def setup_database():
    """Setup database with multiple connection attempts"""
    engine, working_config = try_database_configs()
    
    if not engine:
        print("❌ Could not connect to PostgreSQL with any configuration")
        print("Please ensure PostgreSQL is running and accessible")
        return False
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Update .env with working config
        with open('.env', 'w') as f:
            f.write(f"DATABASE_URL={working_config}\n")
            f.write("SECRET_KEY=your-super-secret-key-change-this-in-production\n")
            f.write("ALGORITHM=HS256\n")
            f.write("ACCESS_TOKEN_EXPIRE_MINUTES=30\n")
        
        print(f"✅ Updated .env with working database URL: {working_config}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

if __name__ == "__main__":
    setup_database()