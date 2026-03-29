from fastapi import APIRouter
from app.data.leave_requests_data import leave_requests_db

router = APIRouter(prefix="/manager", tags=["Manager"])


@router.get("/requests/pending")
def get_pending_requests():
    pending_requests = [
        request for request in leave_requests_db
        if request.status == "Pending"
    ]
    return pending_requests


@router.get("/calendar")
def get_manager_calendar():
    calendar_items = [
        {
            "requestId": request.requestId,
            "userId": request.userId,
            "startDate": request.startDate,
            "endDate": request.endDate,
            "status": request.status
        }
        for request in leave_requests_db
        if request.status in ["Approved", "Pending"]
    ]
    return calendar_items