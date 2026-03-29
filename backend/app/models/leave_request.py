from pydantic import BaseModel, field_validator, model_validator
from datetime import date, datetime

class LeaveRequest(BaseModel):
    requestId: int
    userId: int
    leaveType: str
    startDate: date
    endDate: date
    status: str
    managerComment: str | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None

    @field_validator("startDate")
    @classmethod
    def start_date_not_in_past(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("startDate cannot be in the past")
        return value

    @model_validator(mode="after")
    def end_date_after_start_date(self):
        if self.endDate <= self.startDate:
            raise ValueError("endDate must be after startDate")
        return self