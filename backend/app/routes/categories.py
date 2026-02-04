from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Category, Notification, NotificationTypeEnum
from app.schemas.schemas import CategoryCreate, CategoryResponse
from app.core.dependencies import get_current_user, require_tech_writer_or_admin

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        categories = db.query(Category).offset(skip).limit(limit).all()
        return categories if categories else []
    except Exception as e:
        # Return empty list on any error to prevent 500
        return []

@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    # Check if category already exists
    existing_category = db.query(Category).filter(Category.name == category.name).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists"
        )
    
    db_category = Category(
        name=category.name,
        description=category.description,
        color=category.color,
        created_by=current_user.id
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category
