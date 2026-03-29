from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import date, datetime


class LeaveRequestCreate(BaseModel):
    userId: int
    leaveTypeId: int
    startDate: date
    endDate: date
    status: str = "Pending"
    managerComment: str | None = None

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


class LeaveRequest(BaseModel):
    requestId: int
    userId: int
    leaveTypeId: int
    startDate: date
    endDate: date
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
    def end_date_after_start_date(self):
        if self.endDate <= self.startDate:
            raise ValueError("endDate must be after startDate")
        return self