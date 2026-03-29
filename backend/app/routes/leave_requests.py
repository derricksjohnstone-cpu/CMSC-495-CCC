from fastapi import APIRouter
from app.models.leave_request import LeaveRequest

router = APIRouter()

requests_db = []

@router.get("/requests")
def get_requests():
    return requests_db

@router.post("/requests")
def create_request(request: LeaveRequest):
    requests_db.append(request)
    return {"message": "Leave request created", "request": request}

@router.put("/requests/{request_id}/approve")
def approve_request(request_id: int):
    for request in requests_db:
        if request.requestId == request_id:
            request.status = "Approved"
            return {"message": "Leave request approved", "request": request}
    return {"message": "Leave request not found"}

@router.put("/requests/{request_id}/reject")
def reject_request(request_id: int):
    for request in requests_db:
        if request.requestId == request_id:
            request.status = "Rejected"
            return {"message": "Leave request rejected", "request": request}
    return {"message": "Leave request not found"}