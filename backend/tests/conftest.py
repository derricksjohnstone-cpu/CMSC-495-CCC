import pytest
from unittest.mock import patch, MagicMock
from contextlib import contextmanager
from datetime import date, datetime
from fastapi.testclient import TestClient

from app.models.user import User
from app.models.leave_request import LeaveRequest, LeaveRequestCreate
from app.models.leave_type import LeaveType
from app.models.leave_balance import LeaveBalance
from app.models.request_history import RequestHistory


# ---------------------------------------------------------------------------
# DB row factories (snake_case dicts, as returned by RealDictCursor)
# ---------------------------------------------------------------------------

def make_user_row(**overrides):
    defaults = {
        "user_id": 1,
        "name": "John Employee",
        "email": "employee@test.com",
        "password": "test123",
        "role": "Employee",
        "manager_id": 2,
        "department": "IT",
        "profile_image": None,
    }
    defaults.update(overrides)
    return defaults


def make_request_row(**overrides):
    defaults = {
        "request_id": 1,
        "user_id": 1,
        "reviewer_id": None,
        "leave_type": "Vacation",
        "start_date": date(2027, 4, 10),
        "end_date": date(2027, 4, 12),
        "leave_mode": "Full Day",
        "description": "Family trip",
        "status": "Pending",
        "comments": None,
        "created_at": datetime(2027, 1, 1),
        "updated_at": datetime(2027, 1, 1),
    }
    defaults.update(overrides)
    return defaults


def make_balance_row(**overrides):
    defaults = {
        "balance_id": 1,
        "user_id": 1,
        "leave_type_id": 1,
        "total_days": 10,
        "used_days": 2,
        "year": 2027,
    }
    defaults.update(overrides)
    return defaults


def make_leave_type_row(**overrides):
    defaults = {
        "type_id": 1,
        "name": "Vacation",
    }
    defaults.update(overrides)
    return defaults


def make_history_row(**overrides):
    defaults = {
        "history_id": 1,
        "request_id": 1,
        "action": "submitted",
        "timestamp": datetime(2027, 1, 1),
        "performed_by": 1,
    }
    defaults.update(overrides)
    return defaults


# ---------------------------------------------------------------------------
# Model instance factories (camelCase Pydantic models)
# ---------------------------------------------------------------------------

def make_user(**overrides):
    defaults = dict(
        userId=1, name="John Employee", email="employee@test.com",
        password="test123", role="Employee", managerId=2,
        department="IT", profileImage=None,
    )
    defaults.update(overrides)
    return User(**defaults)


def make_request(**overrides):
    defaults = dict(
        requestId=1, userId=1, reviewerId=None, leaveType="Vacation",
        startDate=date(2027, 4, 10), endDate=date(2027, 4, 12),
        leaveMode="Full Day", description="Family trip", status="Pending",
        comments=None, createdAt=datetime(2027, 1, 1),
        updatedAt=datetime(2027, 1, 1),
    )
    defaults.update(overrides)
    return LeaveRequest(**defaults)


def make_balance(**overrides):
    defaults = dict(
        balanceId=1, userId=1, leaveTypeId=1,
        totalDays=10, usedDays=2, year=2027,
    )
    defaults.update(overrides)
    return LeaveBalance(**defaults)


def make_leave_type(**overrides):
    defaults = dict(leaveTypeId=1, name="Vacation")
    defaults.update(overrides)
    return LeaveType(**defaults)


def make_history(**overrides):
    defaults = dict(
        historyId=1, requestId=1, action="submitted",
        timestamp=datetime(2027, 1, 1), performedBy=1,
    )
    defaults.update(overrides)
    return RequestHistory(**defaults)


# ---------------------------------------------------------------------------
# Mock DB fixture for CRUD tests
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_db():
    """Patches get_db in every CRUD module to yield a mock connection."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()

    # Make cursor work as context manager (with conn.cursor(...) as cur:)
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    @contextmanager
    def fake_get_db():
        yield mock_conn

    # Patch get_db where it's actually referenced (each CRUD module imports it)
    with (
        patch("app.crud.users.get_db", fake_get_db),
        patch("app.crud.leave_types.get_db", fake_get_db),
        patch("app.crud.leave_requests.get_db", fake_get_db),
        patch("app.crud.leave_balances.get_db", fake_get_db),
        patch("app.crud.request_history.get_db", fake_get_db),
    ):
        yield mock_cursor


# ---------------------------------------------------------------------------
# TestClient fixture for route tests
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    """TestClient with DB pool patched out."""
    with patch("app.database.init_pool"), patch("app.database.close_pool"):
        from main import app
        with TestClient(app) as c:
            yield c
