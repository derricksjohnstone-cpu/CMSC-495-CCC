from fastapi import APIRouter
from app.models.user import User

router = APIRouter()

users = []

@router.get("/users")
def get_users():
    return users

@router.post("/users")
def create_user(user: User):
    users.append(user)
    return {"message": "User created", "user": user}