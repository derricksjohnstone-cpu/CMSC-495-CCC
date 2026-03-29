from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.leave_request import LeaveRequest
from app.data.leave_requests_data import leave_requests_db
from app.data.leave_balances_data import leave_balances_db

router = APIRouter(prefix="/requests", tags=["Leave Requests"])


@router.get("/")
def get_requests():
    return leave_requests_db


@router.get("/{request_id}")
def get_request_by_id(request_id: int):
    for request in leave_requests_db:
        if request.requestId == request_id:
            return request
    raise HTTPException(status_code=404, detail="Leave request not found")


@router.post("/")
def create_request(request: LeaveRequest):
    for existing_request in leave_requests_db:
        if existing_request.requestId == request.requestId:
            raise HTTPException(status_code=400, detail="Request ID already exists")

    leave_requests_db.append(request)
    return {"message": "Leave request created", "request": request}


@router.put("/{request_id}/approve")
def approve_request(request_id: int):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Pending":
                raise HTTPException(status_code=400, detail="Only pending requests can be approved")

            request.status = "Approved"
            request.updatedAt = datetime.now()

            days = (request.endDate - request.startDate).days + 1

            for balance in leave_balances_db:
                if balance.userId == request.userId and balance.leaveTypeId == request.leaveTypeId:
                    balance.usedDays += days
                    return {"message": "Leave request approved", "request": request}

            raise HTTPException(status_code=404, detail="Matching leave balance not found")

    raise HTTPException(status_code=404, detail="Leave request not found")


@router.put("/{request_id}/reject")
def reject_request(request_id: int, managerComment: str):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Pending":
                raise HTTPException(status_code=400, detail="Only pending requests can be rejected")
            request.status = "Rejected"
            request.managerComment = managerComment
            request.updatedAt = datetime.now()
            return {"message": "Leave request rejected", "request": request}
    raise HTTPException(status_code=404, detail="Leave request not found")


@router.put("/{request_id}/revision")
def request_revision(request_id: int, managerComment: str):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Pending":
                raise HTTPException(status_code=400, detail="Only pending requests can be sent for revision")
            request.status = "Revision Requested"
            request.managerComment = managerComment
            request.updatedAt = datetime.now()
            return {"message": "Revision requested", "request": request}
    raise HTTPException(status_code=404, detail="Leave request not found")