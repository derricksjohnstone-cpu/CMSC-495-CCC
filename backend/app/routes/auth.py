from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.crud import users as users_crud

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(data: LoginRequest):
    user = users_crud.get_user_by_email(data.email)
    if user and user.password == data.password:
        return {
            "message": "Login successful",
            "user": user
        }

    raise HTTPException(status_code=401, detail="Invalid email or password")