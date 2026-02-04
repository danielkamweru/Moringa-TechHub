from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database.models import User, Content, Comment, RoleEnum, CommentLike
from app.schemas.schemas import CommentCreate, CommentResponse
from app.core.dependencies import get_current_user

router = APIRouter()

def build_comment_tree(comments: List[Comment], db: Session, current_user: User = None) -> List[dict]:
    """Build nested comment structure"""
    comment_dict = {}
    root_comments = []
    
    # First pass: create comment objects
    for comment in comments:
        # Get like count and check if current user liked this comment
        likes_count = db.query(CommentLike).filter(CommentLike.comment_id == comment.id).count()
        is_liked = False
        if current_user:
            user_like = db.query(CommentLike).filter(
                CommentLike.comment_id == comment.id,
                CommentLike.user_id == current_user.id
            ).first()
            is_liked = user_like is not None
        
        comment_data = {
            "id": comment.id,
            "text": comment.text,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "author_id": comment.author_id,
            "content_id": comment.content_id,
            "parent_id": comment.parent_id,
            "author": comment.author,
            "likes_count": likes_count,
            "is_liked": is_liked,
            "replies": []
        }
        comment_dict[comment.id] = comment_data
    
    # Second pass: build tree structure
    for comment in comments:
        if comment.parent_id is None:
            root_comments.append(comment_dict[comment.id])
        else:
            if comment.parent_id in comment_dict:
                comment_dict[comment.parent_id]["replies"].append(comment_dict[comment.id])
    
    return root_comments