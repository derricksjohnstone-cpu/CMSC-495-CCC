from datetime import datetime, date
from app.models.leave_request import LeaveRequest

leave_requests_db = [
    LeaveRequest(
        requestId=1,
        userId=1,
        reviewerId=2,
        leaveType="Vacation",
        startDate=date(2027, 4, 10),
        endDate=date(2027, 4, 12),
        leaveMode="Full Day",
        description="Family trip",
        status="Approved",
        comments=None,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    ),
    LeaveRequest(
        requestId=2,
        userId=1,
        reviewerId=None,
        leaveType="Personal",
        startDate=date(2027, 4, 20),
        endDate=date(2027, 4, 21),
        leaveMode="Full Day",
        description="Personal time off",
        status="Pending",
        comments=None,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )
]