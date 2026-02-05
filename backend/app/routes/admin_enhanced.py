from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from typing import List, Optional
from datetime import datetime

from app.database.connection import get_db
from app.database.models import (
    User, Profile, Content, ContentFlag, RoleEnum, Category,
    FlagReasonEnum, Notification, NotificationTypeEnum, ContentStatusEnum
)
from app.schemas.schemas import UserCreate, UserResponse, ContentResponse, CategoryResponse
from app.core.dependencies import get_current_user, require_admin
from app.core.auth import get_password_hash

router = APIRouter()

# =========================
# User Management (Admin)
# =========================

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    # Check if user already exists
    existing = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create profile if bio or avatar_url provided
    if user_data.bio or user_data.avatar_url:
        profile = Profile(
            user_id=new_user.id,
            bio=user_data.bio,
            avatar_url=user_data.avatar_url
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Reload with profile
    from sqlalchemy.orm import joinedload
    new_user = db.query(User).options(joinedload(User.profile)).filter(User.id == new_user.id).first()
    
    return new_user

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    role: Optional[RoleEnum] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all users with filtering (admin only)"""
    from sqlalchemy.orm import joinedload
    query = db.query(User).options(joinedload(User.profile))
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()