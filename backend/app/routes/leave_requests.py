from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.leave_request import LeaveRequest, LeaveRequestCreate
from app.data.leave_requests_data import leave_requests_db
from app.data.leave_balances_data import leave_balances_db
from app.data.leave_types_data import leave_types_db
from app.data.request_history_data import request_history_db
from app.models.request_history import RequestHistory

router = APIRouter(prefix="/requests", tags=["Leave Requests"])


def calculate_requested_days(start_date, end_date, leave_mode):
    total_days = (end_date - start_date).days + 1
    if leave_mode == "Half Day":
        return 0.5
    return total_days


def find_leave_type_id_by_name(leave_type_name: str):
    for leave_type in leave_types_db:
        if leave_type.name.lower() == leave_type_name.lower():
            return leave_type.leaveTypeId
    return None


def find_matching_balance(user_id, leave_type_name, year):
    leave_type_id = find_leave_type_id_by_name(leave_type_name)
    if leave_type_id is None:
        return None

    for balance in leave_balances_db:
        if (
            balance.userId == user_id
            and balance.leaveTypeId == leave_type_id
            and balance.year == year
        ):
            return balance
    return None

def log_request_history(request_id: int, action: str, performed_by: int | None):
    next_history_id = 1
    if request_history_db:
        next_history_id = max(item.historyId for item in request_history_db) + 1

    history_entry = RequestHistory(
        historyId=next_history_id,
        requestId=request_id,
        action=action,
        performedBy=performed_by
    )

    request_history_db.append(history_entry)


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
        reviewerId=None,
        leaveType=request.leaveType,
        startDate=request.startDate,
        endDate=request.endDate,
        leaveMode=request.leaveMode,
        description=request.description,
        status="Pending",
        comments=None,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )

    leave_requests_db.append(new_request)

    log_request_history(
        request_id=new_request.requestId,
        action="submitted",
        performed_by=new_request.userId
    )

    return {"message": "Leave request created", "request": new_request}


@router.put("/{request_id}/approve")
def approve_request(request_id: int, reviewerId: int):
    for request in leave_requests_db:
        if request.requestId == request_id:

            if request.status != "Pending":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending requests can be approved"
                )

            requested_days = calculate_requested_days(
                request.startDate,
                request.endDate,
                request.leaveMode
            )

            request_year = request.startDate.year

            balance = find_matching_balance(
                request.userId,
                request.leaveType,
                request_year
            )

            if balance is None:
                raise HTTPException(
                    status_code=404,
                    detail="Matching leave balance not found"
                )

            remaining_days = balance.totalDays - balance.usedDays

            if requested_days > remaining_days:
                raise HTTPException(
                    status_code=400,
                    detail="Insufficient leave balance for this request"
                )

            request.status = "Approved"
            request.reviewerId = reviewerId
            request.updatedAt = datetime.now()

            balance.usedDays += requested_days

            log_request_history(
                request_id=request.requestId,
                action="approved",
                performed_by=reviewerId
            )

            return {
                "message": "Leave request approved",
                "request": request
            }

    raise HTTPException(status_code=404, detail="Leave request not found")


@router.put("/{request_id}/reject")
def reject_request(request_id: int, comments: str, reviewerId: int):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Pending":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending requests can be rejected"
                )

            request.status = "Rejected"
            request.comments = comments
            request.reviewerId = reviewerId
            request.updatedAt = datetime.now()

            log_request_history(
                request_id=request.requestId,
                action="rejected",
                performed_by=reviewerId
            )

            return {
                "message": "Leave request rejected",
                "request": request
            }

    raise HTTPException(status_code=404, detail="Leave request not found")


@router.put("/{request_id}/revision")
def request_revision(request_id: int, comments: str, reviewerId: int):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Pending":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending requests can be sent for revision"
                )

            request.status = "Revision Requested"
            request.comments = comments
            request.reviewerId = reviewerId
            request.updatedAt = datetime.now()

            log_request_history(
                request_id=request.requestId,
                action="revision requested",
                performed_by=reviewerId
            )

            return {
                "message": "Revision requested",
                "request": request
            }

    raise HTTPException(status_code=404, detail="Leave request not found")


@router.put("/{request_id}/resubmit")
def resubmit_request(request_id: int):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Revision Requested":
                raise HTTPException(
                    status_code=400,
                    detail="Only revision requested items can be resubmitted"
                )

            request.status = "Pending"
            request.reviewerId = None
            request.updatedAt = datetime.now()

            log_request_history(
                request_id=request.requestId,
                action="resubmitted",
                performed_by=request.userId
            )

            return {
                "message": "Leave request resubmitted",
                "request": request
            }

    raise HTTPException(status_code=404, detail="Leave request not found")

@router.get("/{request_id}/history")
def get_request_history(request_id: int):
    history = [item for item in request_history_db if item.requestId == request_id]

    if not history:
        raise HTTPException(status_code=404, detail="No history found for this request")

    return history


@router.get("/history/all")
def get_all_request_history():
    return request_history_db