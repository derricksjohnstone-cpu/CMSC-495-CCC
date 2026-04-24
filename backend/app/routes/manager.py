from fastapi import APIRouter
from app.crud import leave_requests as leave_requests_crud

router = APIRouter(prefix="/manager", tags=["Manager"])


@router.get("/requests/pending")
def get_pending_requests():
    return leave_requests_crud.get_requests_by_status("Pending")


@router.get("/calendar")
def get_manager_calendar():
    return leave_requests_crud.get_calendar_requests()