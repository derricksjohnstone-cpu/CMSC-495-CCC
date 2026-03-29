from pydantic import BaseModel

class LeaveBalance(BaseModel):
    balanceId: int
    userId: int
    leaveTypeId: int
    totalDays: int
    usedDays: int
    year: int