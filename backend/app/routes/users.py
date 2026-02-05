from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Profile, RoleEnum, Content, Category, Like, ContentStatusEnum, user_categories
from app.schemas.schemas import UserResponse, UserUpdate, UserCreate
from app.core.dependencies import get_current_user, require_admin
from app.core.auth import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    users = db.query(User).options(joinedload(User.profile)).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(joinedload(User.profile)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user