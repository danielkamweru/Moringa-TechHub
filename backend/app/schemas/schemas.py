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