from pydantic import (
    BaseModel,
    EmailStr,
    constr,
    field_validator,
    model_validator,
    field_serializer,
    ConfigDict,
)
from typing import Optional
from datetime import datetime

from app.database.models import (
    RoleEnum,
    ContentStatusEnum,
    ContentTypeEnum,
)
# =========================
# User schemas
# =========================

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: constr(min_length=8, strip_whitespace=True)
    role: Optional[RoleEnum] = RoleEnum.USER

    @field_validator("password")
    @classmethod
    def password_max_72_bytes(cls, v: str):
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return v
    

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: RoleEnum
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)




# =========================
# Auth schemas
# =========================

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

    @field_validator("password")
    @classmethod
    def password_max_72_bytes(cls, v: str):
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return v

    @model_validator(mode="after")
    def require_username_or_email(self):
        if not self.username and not self.email:
            raise ValueError("Either username or email must be provided")
        return self
    


# =========================
# Category schemas
# =========================

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#3B82F6"


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    created_by: Optional[int]

    model_config = ConfigDict(from_attributes=True)

