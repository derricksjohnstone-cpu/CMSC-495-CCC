from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.leave_request import LeaveRequest, LeaveRequestCreate
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
def create_request(request: LeaveRequestCreate):
    next_id = 1
    if leave_requests_db:
        next_id = max(existing_request.requestId for existing_request in leave_requests_db) + 1

    new_request = LeaveRequest(
        requestId=next_id,
        userId=request.userId,
        leaveTypeId=request.leaveTypeId,
        startDate=request.startDate,
        endDate=request.endDate,
        status=request.status,
        managerComment=request.managerComment,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )

    leave_requests_db.append(new_request)
    return {"message": "Leave request created", "request": new_request}


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


@router.put("/{request_id}/resubmit")
def resubmit_request(request_id: int):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Revision Requested":
                raise HTTPException(status_code=400, detail="Only revision requested items can be resubmitted")

            request.status = "Pending"
            request.updatedAt = datetime.now()

            return {"message": "Leave request resubmitted", "request": request}

    raise HTTPException(status_code=404, detail="Leave request not found")