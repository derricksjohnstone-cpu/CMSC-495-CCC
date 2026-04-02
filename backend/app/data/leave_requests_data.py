from datetime import datetime, date
from app.models.leave_request import LeaveRequest

leave_requests_db = [
    LeaveRequest(
        requestId=1,
        userId=1,
        leaveTypeId=1,
        startDate=date(2027, 4, 10),
        endDate=date(2027, 4, 12),
        leaveMode="Full Day",
        status="Approved",
        managerComment=None,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    ),
    LeaveRequest(
        requestId=2,
        userId=1,
        leaveTypeId=2,
        startDate=date(2027, 4, 20),
        endDate=date(2027, 4, 21),
        leaveMode="Full Day",
        status="Pending",
        managerComment=None,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )
]