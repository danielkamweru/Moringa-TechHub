from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json

app = FastAPI(title="Moringa TechHub API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple data models
class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    full_name: str
    role: str

class Category(BaseModel):
    id: int
    name: str
    description: str
    color: str

class Content(BaseModel):
    id: int
    title: str
    content_text: str
    content_type: str
    author: User
    category: Category
    likes_count: int = 0
    dislikes_count: int = 0
    views_count: int = 0
    created_at: str

# Mock data
mock_users = {
    "admin": {"id": 1, "username": "admin", "full_name": "Admin User", "role": "admin", "password": "admin123"},
    "techwriter": {"id": 2, "username": "techwriter", "full_name": "Tech Writer", "role": "tech_writer", "password": "writer123"},
    "regularuser": {"id": 3, "username": "regularuser", "full_name": "Regular User", "role": "user", "password": "user123"}
}

mock_categories = [
    {"id": 1, "name": "DevOps", "description": "DevOps practices and tools", "color": "#FF6B6B"},
    {"id": 2, "name": "Frontend", "description": "Frontend development", "color": "#4ECDC4"},
    {"id": 3, "name": "Backend", "description": "Backend development", "color": "#45B7D1"},
    {"id": 4, "name": "Fullstack", "description": "Full-stack development", "color": "#96CEB4"},
    {"id": 5, "name": "Data Science", "description": "Data science and analytics", "color": "#FFEAA7"},
    {"id": 6, "name": "AI/ML", "description": "Artificial Intelligence and Machine Learning", "color": "#DDA0DD"}
]

mock_content = [
    {
        "id": 1,
        "title": "Getting Started with React Hooks",
        "content_text": "React Hooks revolutionized how we write React components. In this comprehensive guide, we'll explore useState, useEffect, and custom hooks to build powerful applications.",
        "content_type": "article",
        "author": {"id": 2, "username": "techwriter", "full_name": "Tech Writer", "role": "tech_writer"},
        "category": {"id": 2, "name": "Frontend", "description": "Frontend development", "color": "#4ECDC4"},
        "likes_count": 15,
        "dislikes_count": 2,
        "views_count": 234,
        "created_at": "2024-01-15T10:30:00Z"
    },
    {
        "id": 2,
        "title": "Docker Best Practices for Developers",
        "content_text": "Docker has become an essential tool for modern development. Learn the best practices for containerizing your applications, optimizing images, and managing multi-container setups.",
        "content_type": "article",
        "author": {"id": 2, "username": "techwriter", "full_name": "Tech Writer", "role": "tech_writer"},
        "category": {"id": 1, "name": "DevOps", "description": "DevOps practices and tools", "color": "#FF6B6B"},
        "likes_count": 28,
        "dislikes_count": 1,
        "views_count": 456,
        "created_at": "2024-01-14T14:20:00Z"
    },
    {
        "id": 3,
        "title": "Building RESTful APIs with FastAPI",
        "content_text": "FastAPI is a modern, fast web framework for building APIs with Python. Discover how to create robust, scalable APIs with automatic documentation and type validation.",
        "content_type": "article",
        "author": {"id": 2, "username": "techwriter", "full_name": "Tech Writer", "role": "tech_writer"},
        "category": {"id": 3, "name": "Backend", "description": "Backend development", "color": "#45B7D1"},
        "likes_count": 22,
        "dislikes_count": 0,
        "views_count": 189,
        "created_at": "2024-01-13T09:15:00Z"
    }
]

@app.get("/")
async def root():
    return {"message": "Welcome to Moringa TechHub API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/auth/login")
async def login(login_data: LoginRequest):
    user_data = mock_users.get(login_data.username)
    
    if not user_data or user_data["password"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Remove password from response
    user_response = {k: v for k, v in user_data.items() if k != "password"}
    
    return {
        "access_token": "mock_token_" + login_data.username,
        "token_type": "bearer",
        "user": user_response
    }

@app.get("/api/categories/")
async def get_categories():
    return mock_categories

@app.get("/api/content/")
async def get_content():
    return mock_content