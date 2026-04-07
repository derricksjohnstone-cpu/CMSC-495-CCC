from pydantic import BaseModel


class User(BaseModel):
    userId: int
    name: str
    email: str
    password: str
    role: str
    managerId: int | None = None
    department: str | None = None
    profileImage: str | None = None