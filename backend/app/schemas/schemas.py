from pydantic import (
    BaseModel,
    EmailStr,
    constr,
    field_validator,
    model_validator,
    field_serializer,
    ConfigDict,
)