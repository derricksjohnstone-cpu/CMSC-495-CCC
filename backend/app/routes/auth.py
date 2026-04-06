from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.data.users_data import users_db

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(data: LoginRequest):
    for user in users_db:
        if user.email == data.email and user.password == data.password:
            return {
                "message": "Login successful",
                "user": user
            }

    raise HTTPException(status_code=401, detail="Invalid email or password")