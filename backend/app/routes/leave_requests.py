from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.leave_request import LeaveRequest, LeaveRequestCreate
from app.crud import leave_requests as leave_requests_crud
from app.crud import leave_balances as leave_balances_crud
from app.crud import leave_types as leave_types_crud
from app.crud import request_history as request_history_crud

router = APIRouter(prefix="/requests", tags=["Leave Requests"])


def calculate_requested_days(start_date, end_date, leave_mode):
    total_days = (end_date - start_date).days + 1
    if leave_mode == "Half Day":
        return 0.5
    return total_days


def find_leave_type_id_by_name(leave_type_name: str):
    leave_type = leave_types_crud.get_leave_type_by_name(leave_type_name)
    if leave_type:
        return leave_type.leaveTypeId
    return None


def find_matching_balance(user_id, leave_type_name, year):
    leave_type_id = find_leave_type_id_by_name(leave_type_name)
    if leave_type_id is None:
        return None
    return leave_balances_crud.get_balance(user_id, leave_type_id, year)


@router.get("/")
def get_requests():
    return leave_requests_crud.get_all_requests()


@router.get("/{request_id}")
def get_request_by_id(request_id: int):
    request = leave_requests_crud.get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return request


@router.post("/")
def create_request(request: LeaveRequestCreate):
    new_request = leave_requests_crud.create_request(request)

    request_history_crud.create_history(
        request_id=new_request.requestId,
        action="submitted",
        performed_by=new_request.userId,
    )

    return {"message": "Leave request created", "request": new_request}


@router.put("/{request_id}/approve")
def approve_request(request_id: int, reviewerId: int):
    request = leave_requests_crud.get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if request.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be approved",
        )

    requested_days = calculate_requested_days(
        request.startDate, request.endDate, request.leaveMode
    )

    request_year = request.startDate.year

    balance = find_matching_balance(request.userId, request.leaveType, request_year)

    if balance is None:
        raise HTTPException(
            status_code=404, detail="Matching leave balance not found"
        )

    remaining_days = balance.totalDays - balance.usedDays

    if requested_days > remaining_days:
        raise HTTPException(
            status_code=400,
            detail="Insufficient leave balance for this request",
        )

    updated = leave_requests_crud.update_request(
        request_id, status="Approved", reviewerId=reviewerId
    )

    leave_balances_crud.update_used_days(
        balance.balanceId, balance.usedDays + requested_days
    )

    request_history_crud.create_history(
        request_id=request_id, action="approved", performed_by=reviewerId
    )

    return {"message": "Leave request approved", "request": updated}


@router.put("/{request_id}/reject")
def reject_request(request_id: int, comments: str, reviewerId: int):
    request = leave_requests_crud.get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if request.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be rejected",
        )

    updated = leave_requests_crud.update_request(
        request_id, status="Rejected", comments=comments, reviewerId=reviewerId
    )

    request_history_crud.create_history(
        request_id=request_id, action="rejected", performed_by=reviewerId
    )

    return {"message": "Leave request rejected", "request": updated}


@router.put("/{request_id}/revision")
def request_revision(request_id: int, comments: str, reviewerId: int):
    request = leave_requests_crud.get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if request.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be sent for revision",
        )

    updated = leave_requests_crud.update_request(
        request_id,
        status="Revision Requested",
        comments=comments,
        reviewerId=reviewerId,
    )

    request_history_crud.create_history(
        request_id=request_id,
        action="revision requested",
        performed_by=reviewerId,
    )

    return {"message": "Revision requested", "request": updated}


@router.put("/{request_id}/resubmit")
def resubmit_request(request_id: int):
    request = leave_requests_crud.get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if request.status != "Revision Requested":
        raise HTTPException(
            status_code=400,
            detail="Only revision requested items can be resubmitted",
        )

    updated = leave_requests_crud.update_request(
        request_id, status="Pending", reviewerId=None
    )

    request_history_crud.create_history(
        request_id=request_id,
        action="resubmitted",
        performed_by=request.userId,
    )

    return {"message": "Leave request resubmitted", "request": updated}


@router.get("/{request_id}/history")
def get_request_history(request_id: int):
    history = request_history_crud.get_history_by_request(request_id)

    if not history:
        raise HTTPException(
            status_code=404, detail="No history found for this request"
        )

    return history


@router.get("/history/all")
def get_all_request_history():
    return request_history_crud.get_all_history()
