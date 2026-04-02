from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.leave_request import LeaveRequest, LeaveRequestCreate
from app.data.leave_requests_data import leave_requests_db
from app.data.leave_balances_data import leave_balances_db
from app.data.leave_types_data import leave_types_db

router = APIRouter(prefix="/requests", tags=["Leave Requests"])


def calculate_requested_days(start_date, end_date, leave_mode):
    total_days = (end_date - start_date).days + 1
    if leave_mode == "Half Day":
        return 0.5
    return total_days


def find_matching_balance(user_id, leave_type_id, year):
    for balance in leave_balances_db:
        if (
            balance.userId == user_id
            and balance.leaveTypeId == leave_type_id
            and balance.year == year
        ):
            return balance
    return None

def get_leave_type_id_from_input(request):
    if request.leaveTypeId is not None:
        return request.leaveTypeId

    if request.leaveType is not None:
        for leave_type in leave_types_db:
            if leave_type.name.lower() == request.leaveType.lower():
                return leave_type.leaveTypeId

    raise HTTPException(status_code=400, detail="Invalid leave type")

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

    resolved_leave_type_id = get_leave_type_id_from_input(request)

    new_request = LeaveRequest(
        requestId=next_id,
        userId=request.userId,
        leaveTypeId=resolved_leave_type_id,
        startDate=request.startDate,
        endDate=request.endDate,
        leaveMode=request.leaveMode,
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
                request.leaveTypeId,
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
            request.updatedAt = datetime.now()

            balance.usedDays += requested_days

            return {
                "message": "Leave request approved",
                "request": request
            }

    raise HTTPException(status_code=404, detail="Leave request not found")


@router.put("/{request_id}/reject")
def reject_request(request_id: int, managerComment: str):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Pending":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending requests can be rejected"
                )

            request.status = "Rejected"
            request.managerComment = managerComment
            request.updatedAt = datetime.now()

            return {
                "message": "Leave request rejected",
                "request": request
            }

    raise HTTPException(status_code=404, detail="Leave request not found")


@router.put("/{request_id}/revision")
def request_revision(request_id: int, managerComment: str):
    for request in leave_requests_db:
        if request.requestId == request_id:
            if request.status != "Pending":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending requests can be sent for revision"
                )

            request.status = "Revision Requested"
            request.managerComment = managerComment
            request.updatedAt = datetime.now()

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
            request.updatedAt = datetime.now()

            return {
                "message": "Leave request resubmitted",
                "request": request
            }

    raise HTTPException(status_code=404, detail="Leave request not found")