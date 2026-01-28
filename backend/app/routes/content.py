from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime
from app.database.connection import get_db
from app.database.models import User, Content, ContentStatusEnum, Like, Category, RoleEnum
from app.schemas.schemas import ContentCreate, ContentUpdate, ContentResponse, LikeCreate
from app.core.dependencies import get_current_user, require_admin, require_tech_writer_or_admin

router = APIRouter()

@router.get("/", response_model=List[ContentResponse])
def get_content(
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    status: Optional[ContentStatusEnum] = ContentStatusEnum.PUBLISHED,
    db: Session = Depends(get_db)
):
    query = db.query(Content)
    
    if category_id:
        query = query.filter(Content.category_id == category_id)
    
    if status:
        query = query.filter(Content.status == status)
    
    # Add likes and comments count
    content_list = query.offset(skip).limit(limit).all()
    
    for content in content_list:
        content.likes_count = db.query(Like).filter(
            Like.content_id == content.id, Like.is_like == True
        ).count()
        content.dislikes_count = db.query(Like).filter(
            Like.content_id == content.id, Like.is_like == False
        ).count()
        content.comments_count = len(content.comments)
    
    return content_list

@router.post("/", response_model=ContentResponse)
def create_content(
    content: ContentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify category exists
    category = db.query(Category).filter(Category.id == content.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    db_content = Content(
        title=content.title,
        content_text=content.content_text,
        content_type=content.content_type,
        media_url=content.media_url,
        thumbnail_url=content.thumbnail_url,
        tags=content.tags,
        author_id=current_user.id,
        category_id=content.category_id,
        status=ContentStatusEnum.DRAFT
    )
    
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    return db_content

@router.get("/{content_id}", response_model=ContentResponse)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Increment view count
    content.views_count += 1
    db.commit()
    
    # Add counts
    content.likes_count = db.query(Like).filter(
        Like.content_id == content.id, Like.is_like == True
    ).count()
    content.dislikes_count = db.query(Like).filter(
        Like.content_id == content.id, Like.is_like == False
    ).count()
    content.comments_count = len(content.comments)
    
    return content

@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int,
    content_update: ContentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Only author or admin can update
    if content.author_id != current_user.id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this content"
        )
    
    for field, value in content_update.dict(exclude_unset=True).items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    return content

@router.delete("/{content_id}")
def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Only author or admin can delete
    if content.author_id != current_user.id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this content"
        )
    
    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}

@router.put("/{content_id}/approve")
def approve_content(
    content_id: int,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.status = ContentStatusEnum.PUBLISHED
    content.published_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Content approved and published"}

@router.put("/{content_id}/reject")
def reject_content(
    content_id: int,
    current_user: User = Depends(require_tech_writer_or_admin),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.status = ContentStatusEnum.REJECTED
    db.commit()
    
    return {"message": "Content rejected"}

@router.post("/{content_id}/like")
def like_content(
    content_id: int,
    like_data: LikeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Check if user already liked/disliked this content
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.content_id == content_id
    ).first()
    
    if existing_like:
        # Update existing like/dislike
        existing_like.is_like = like_data.is_like
    else:
        # Create new like/dislike
        new_like = Like(
            user_id=current_user.id,
            content_id=content_id,
            is_like=like_data.is_like
        )
        db.add(new_like)
    
    db.commit()
    
    action = "liked" if like_data.is_like else "disliked"
    return {"message": f"Content {action} successfully"}

@router.post("/{content_id}/wishlist")
def add_to_wishlist(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content not in current_user.wishlist:
        current_user.wishlist.append(content)
        db.commit()
        return {"message": "Content added to wishlist"}
    
    return {"message": "Content already in wishlist"}

@router.delete("/{content_id}/wishlist")
def remove_from_wishlist(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content in current_user.wishlist:
        current_user.wishlist.remove(content)
        db.commit()
        return {"message": "Content removed from wishlist"}
    
    return {"message": "Content not in wishlist"}

@router.get("/user/wishlist", response_model=List[ContentResponse])
def get_user_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.wishlist