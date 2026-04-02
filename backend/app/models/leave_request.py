from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import date, datetime

class LeaveRequestCreate(BaseModel):
    userId: int
    leaveTypeId: int | None = None
    leaveType: str | None = None
    startDate: date
    endDate: date
    leaveMode: str = "Full Day"
    status: str = "Pending"
    managerComment: str | None = None

    @field_validator("startDate")
    @classmethod
    def start_date_not_in_past(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("startDate cannot be in the past")
        return value

    @model_validator(mode="after")
    def validate_dates(self):
        if self.endDate < self.startDate:
            raise ValueError("endDate cannot be before startDate")

        if self.leaveMode == "Half Day" and self.startDate != self.endDate:
            raise ValueError("Half Day leave must be a single-day request")

        if self.leaveTypeId is None and self.leaveType is None:
            raise ValueError("Either leaveTypeId or leaveType is required")

        return self


class LeaveRequest(BaseModel):
    requestId: int
    userId: int
    leaveTypeId: int
    startDate: date
    endDate: date
    leaveMode: str = "Full Day"
    status: str = "Pending"
    managerComment: str | None = None
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

    @field_validator("startDate")
    @classmethod
    def start_date_not_in_past(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("startDate cannot be in the past")
        return value

    @model_validator(mode="after")
    def validate_dates(self):
        if self.endDate < self.startDate:
            raise ValueError("endDate cannot be before startDate")

        if self.leaveMode == "Half Day" and self.startDate != self.endDate:
            raise ValueError("Half Day leave must be a single-day request")

        return self