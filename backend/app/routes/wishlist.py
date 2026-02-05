from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database.connection import get_db
from app.database.models import Content, User, user_wishlist
from app.schemas.schemas import ContentResponse
from app.core.dependencies import get_current_user

router = APIRouter(tags=["wishlist"])

@router.get("/", response_model=List[ContentResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Query content with all necessary relationships
        content = db.query(Content).join(user_wishlist).filter(
            user_wishlist.c.user_id == current_user.id
        ).options(
            joinedload(Content.author),
            joinedload(Content.category)
        ).all()
        
        if not content:
            return []
            
        return content
    except Exception as e:
        print(f"Error fetching wishlist: {e}")
        # Return empty list on error to prevent crashes
        return []