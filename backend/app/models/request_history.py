from pydantic import BaseModel, Field
from datetime import datetime


class RequestHistory(BaseModel):
    historyId: int
    requestId: int
    action: str
    timestamp: datetime = Field(default_factory=datetime.now)
    performedBy: int | None = None