from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database.connection import get_db
from app.database.models import Content, User, user_wishlist
from app.schemas.schemas import ContentResponse
from app.core.dependencies import get_current_user

router = APIRouter(tags=["wishlist"])

@router.get("/")
def get_wishlist_simple():
    print("GET /api/wishlist called (simple version)")
    return [{"id": 1, "title": "Sample Wishlist Item", "content_text": "This is a sample item"}]

@router.get("/auth", response_model=List[ContentResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"GET /api/wishlist called by user: {current_user.username}")
    try:
        # Query content with all necessary relationships
        content = db.query(Content).join(user_wishlist).filter(
            user_wishlist.c.user_id == current_user.id
        ).options(
            joinedload(Content.author),
            joinedload(Content.category)
        ).all()
        
        print(f"Found {len(content)} items in wishlist")
        if not content:
            return []
        
        # Transform data to match ContentResponse format
        wishlist_data = []
        for item in content:
            # Count likes and comments
            likes_count = len(item.likes) if hasattr(item, 'likes') else 0
            comments_count = len(item.comments) if hasattr(item, 'comments') else 0
            
            # Handle author avatar_url safely
            author_data = None
            if item.author:
                author_data = {
                    "id": item.author.id,
                    "username": item.author.username,
                    "full_name": item.author.full_name,
                    "avatar_url": getattr(item.author, 'avatar_url', None),
                    "email": getattr(item.author, 'email', ''),
                    "role": getattr(item.author, 'role', 'user'),
                    "is_active": getattr(item.author, 'is_active', True),
                    "created_at": getattr(item.author, 'created_at', ''),
                }
            
            # Handle category fields safely
            category_data = None
            if item.category:
                category_data = {
                    "id": item.category.id,
                    "name": item.category.name,
                    "description": item.category.description,
                    "color": item.category.color,
                    "created_at": getattr(item.category, 'created_at', ''),
                    "created_by": getattr(item.category, 'created_by', '')
                }
            
            wishlist_item = {
                "id": item.id,
                "title": item.title,
                "content_text": item.content_text,
                "content_type": item.content_type.value if hasattr(item.content_type, 'value') else str(item.content_type),
                "media_url": item.media_url,
                "thumbnail_url": item.thumbnail_url,
                "tags": item.tags,
                "subtitle": item.subtitle,
                "status": item.status.value if hasattr(item.status, 'value') else str(item.status),
                                "created_at": item.created_at,
                "updated_at": item.updated_at,
                "published_at": item.published_at,
                "author_id": item.author_id,
                "category_id": item.category_id,
                "author": author_data,
                "category": category_data,
                "likes_count": likes_count,
                "dislikes_count": 0,
                "comments_count": comments_count,
                "is_flagged": False
            }
            wishlist_data.append(wishlist_item)
            
        print(f"Wishlist data prepared: {len(wishlist_data)} items")
        return wishlist_data
    except Exception as e:
        print(f"Error fetching wishlist: {e}")
        # Return empty list on error to prevent crashes
        return []
    
@router.post("/auth/{content_id}")
def add_to_wishlist_auth(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"Attempting to add content {content_id} to wishlist for user {current_user.username}")
        
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content {content_id} not found")
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Check if already in wishlist
        existing = db.query(user_wishlist).filter(
            user_wishlist.c.user_id == current_user.id,
            user_wishlist.c.content_id == content_id
        ).first()
        
        if existing:
            print(f"Content {content_id} already in user's wishlist")
            return {"message": "Content already in wishlist", "already_exists": True}
        
        # Add to wishlist
        stmt = user_wishlist.insert().values(user_id=current_user.id, content_id=content_id)
        db.execute(stmt)
        db.commit()
        
        print(f"Successfully added content {content_id} to wishlist")
        return {"message": "Added to wishlist successfully"}
    except Exception as e:
        print(f"Error adding to wishlist: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add to wishlist")

@router.post("/{content_id}")
def add_to_wishlist(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"=== ADD TO WISHLIST DEBUG ===")
        print(f"User: {current_user.username} (ID: {current_user.id})")
        print(f"Content ID: {content_id}")
        
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"ERROR: Content {content_id} not found")
            raise HTTPException(status_code=404, detail="Content not found")
        
        print(f"Found content: {content.title}")
        
        # Check if already in wishlist
        existing = db.query(user_wishlist).filter(
            user_wishlist.c.user_id == current_user.id,
            user_wishlist.c.content_id == content_id
        ).first()
        
        if existing:
            print(f"Content {content_id} already in user's wishlist")
            return {"message": "Content already in wishlist", "already_exists": True}
        
        print(f"Adding to wishlist - user_id: {current_user.id}, content_id: {content_id}")
        
        # Add to wishlist
        stmt = user_wishlist.insert().values(user_id=current_user.id, content_id=content_id)
        print(f"SQL statement: {stmt}")
        result = db.execute(stmt)
        print(f"Execute result: {result}")
        db.commit()
        
        print(f"Successfully added content {content_id} to wishlist")
        return {"message": "Added to wishlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding to wishlist: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add to wishlist: {str(e)}")
    
@router.delete("/auth/{content_id}")
def remove_from_wishlist_auth(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"Attempting to remove content {content_id} from wishlist for user {current_user.username}")
        
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            print(f"Content {content_id} not found")
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Check if in wishlist
        existing = db.query(user_wishlist).filter(
            user_wishlist.c.user_id == current_user.id,
            user_wishlist.c.content_id == content_id
        ).first()
        
        if not existing:
            print(f"Content {content_id} not in user's wishlist")
            return {"message": "Content not in wishlist"}
        
        # Remove from wishlist
        stmt = user_wishlist.delete().where(
            user_wishlist.c.user_id == current_user.id,
            user_wishlist.c.content_id == content_id
        )
        db.execute(stmt)
        db.commit()
        
        print(f"Successfully removed content {content_id} from wishlist")
        return {"message": "Removed from wishlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing from wishlist: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to remove from wishlist")

@router.delete("/{content_id}")
def remove_from_wishlist(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Remove from wishlist
        stmt = user_wishlist.delete().where(
            user_wishlist.c.user_id == current_user.id,
            user_wishlist.c.content_id == content_id
        )
        result = db.execute(stmt)
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=400, detail="Content not in wishlist")
        
        return {"message": "Content removed from wishlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing from wishlist: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove from wishlist")