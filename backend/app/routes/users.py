from fastapi import APIRouter, HTTPException
from app.models.user import User, PasswordUpdateRequest
from app.data.users_data import users_db
from app.data.leave_requests_data import leave_requests_db
from app.data.leave_balances_data import leave_balances_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
def get_users():
    return users_db


@router.post("/")
def create_user(user: User):
    for existing_user in users_db:
        if existing_user.userId == user.userId:
            raise HTTPException(status_code=400, detail="User ID already exists")
        if existing_user.email == user.email:
            raise HTTPException(status_code=400, detail="Email already exists")

    users_db.append(user)
    return {"message": "User created", "user": user}


@router.get("/{user_id}")
def get_user_by_id(user_id: int):
    for user in users_db:
        if user.userId == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

@router.put("/{user_id}/password")
def update_user_password(user_id: int, password_data: PasswordUpdateRequest):
    for user in users_db:
        if user.userId == user_id:
            if user.password != password_data.currentPassword:
                raise HTTPException(status_code=400, detail="Current password is incorrect")

            if password_data.currentPassword == password_data.newPassword:
                raise HTTPException(status_code=400, detail="New password must be different from current password")

            user.password = password_data.newPassword
            return {"message": "Password updated successfully"}

    raise HTTPException(status_code=404, detail="User not found")

@router.get("/{user_id}/requests")
def get_requests_for_user(user_id: int):
    user_requests = [request for request in leave_requests_db if request.userId == user_id]
    return user_requests


@router.get("/{user_id}/balances")
def get_balances_for_user(user_id: int):
    user_balances = [balance for balance in leave_balances_db if balance.userId == user_id]
    return user_balances