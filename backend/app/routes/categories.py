from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
from app.database.connection import get_db
from app.database.models import User, Content, Category, Notification, NotificationTypeEnum, user_categories
from app.schemas.schemas import CategoryCreate, CategoryResponse
from app.core.dependencies import get_current_user, require_tech_writer_or_admin

DEBUG_MODE = os.getenv("ENVIRONMENT") == "development"

router = APIRouter()

@router.get("")
@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories

@router.post("")
@router.post("/")
def create_category(
    category: CategoryCreate,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    
    # Check if category with this name already exists
    existing_category = db.query(Category).filter(Category.name == category.name).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
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

@router.get("/user/subscriptions")
def get_user_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.subscribed_categories

@router.post("/{category_id}/subscribe")
def subscribe_to_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category not in current_user.subscribed_categories:
        current_user.subscribed_categories.append(category)
        db.commit()
        
        try:
            notification = Notification(
                user_id=current_user.id,
                notification_type=NotificationTypeEnum.STATUS_CHANGE,
                title=f"Subscribed to {category.name}",
                message=f"You have successfully subscribed to the {category.name} category."
            )
            db.add(notification)
            db.commit()
        except Exception as e:
            if DEBUG_MODE:
                print(f"Failed to create notification: {e}")
    
    return {"message": "Successfully subscribed to category", "category_id": category_id}

@router.delete("/{category_id}/subscribe")
def unsubscribe_from_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category in current_user.subscribed_categories:
        current_user.subscribed_categories.remove(category)
        db.commit()
        return {"message": "Successfully unsubscribed from category"}
    
    return {"message": "You were not subscribed to this category"}

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryCreate,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if name conflicts with existing category (excluding current one)
    existing_category = db.query(Category).filter(
        Category.name == category.name,
        Category.id != category_id
    ).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    db_category.name = category.name
    db_category.description = category.description
    db_category.color = category.color
    
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has content
    if db_category.content and len(db_category.content) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with existing content. Please move or delete the content first."
        )
    
    db.delete(db_category)
    db.commit()
    
    return {"message": "Category deleted successfully"}
