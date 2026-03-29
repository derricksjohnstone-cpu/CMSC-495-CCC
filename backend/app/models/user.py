from pydantic import BaseModel

class User(BaseModel):
    userId: int
    name: str
    email: str
    password: str
    role: str
    department: str | None = None
    profileImage: str | None = None