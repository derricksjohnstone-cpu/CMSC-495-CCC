from pydantic import BaseModel

class User(BaseModel):
    userId: int
    name: str
    email: str
    password: str
    role: str
    department: str | None = None
    profileImage: str | None = None

from pydantic import BaseModel, field_validator

class PasswordUpdateRequest(BaseModel):
    currentPassword: str
    newPassword: str

    @field_validator("newPassword")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("New password must be at least 6 characters long")
        return value