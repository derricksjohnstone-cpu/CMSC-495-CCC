from app.models.request_history import RequestHistory
from datetime import datetime

request_history_db = [
    RequestHistory(
        historyId=1,
        requestId=1,
        action="submitted",
        timestamp=datetime.now(),
        performedBy=1
    ),
    RequestHistory(
        historyId=2,
        requestId=1,
        action="approved",
        timestamp=datetime.now(),
        performedBy=2
    )
]