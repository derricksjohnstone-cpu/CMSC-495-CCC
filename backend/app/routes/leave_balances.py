from fastapi import APIRouter
from app.crud import leave_balances as leave_balances_crud

router = APIRouter(prefix="/balances", tags=["Leave Balances"])


@router.get("/")
def get_balances():
    return leave_balances_crud.get_all_balances()