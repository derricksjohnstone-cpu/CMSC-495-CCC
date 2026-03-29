from fastapi import APIRouter
from app.data.leave_balances_data import leave_balances_db

router = APIRouter(prefix="/balances", tags=["Leave Balances"])


@router.get("/")
def get_balances():
    return leave_balances_db