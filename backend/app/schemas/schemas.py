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
