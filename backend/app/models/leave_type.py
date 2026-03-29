from pydantic import BaseModel

class LeaveType(BaseModel):
    leaveTypeId: int
    name: str