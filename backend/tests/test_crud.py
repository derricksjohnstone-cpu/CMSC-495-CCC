"""Tests for all CRUD modules. Each test patches get_db via the mock_db fixture."""
import pytest
from datetime import date, datetime
from unittest.mock import patch, MagicMock
from contextlib import contextmanager

from tests.conftest import (
    make_user_row, make_request_row, make_balance_row,
    make_leave_type_row, make_history_row,
)


# ===================================================================
# CRUD: users
# ===================================================================

class TestCrudUsers:
    def test_get_all_users(self, mock_db):
        mock_db.fetchall.return_value = [make_user_row(), make_user_row(user_id=2, name="Sarah")]
        from app.crud.users import get_all_users
        result = get_all_users()
        assert len(result) == 2
        assert result[0].userId == 1
        assert result[1].name == "Sarah"

    def test_get_all_users_empty(self, mock_db):
        mock_db.fetchall.return_value = []
        from app.crud.users import get_all_users
        assert get_all_users() == []

    def test_get_user_by_id_found(self, mock_db):
        mock_db.fetchone.return_value = make_user_row()
        from app.crud.users import get_user_by_id
        user = get_user_by_id(1)
        assert user.userId == 1
        assert user.email == "employee@test.com"
        mock_db.execute.assert_called_once()
        args = mock_db.execute.call_args
        assert "WHERE user_id = %s" in args[0][0]
        assert args[0][1] == (1,)

    def test_get_user_by_id_not_found(self, mock_db):
        mock_db.fetchone.return_value = None
        from app.crud.users import get_user_by_id
        assert get_user_by_id(999) is None

    def test_get_user_by_email(self, mock_db):
        mock_db.fetchone.return_value = make_user_row()
        from app.crud.users import get_user_by_email
        user = get_user_by_email("employee@test.com")
        assert user.email == "employee@test.com"

    def test_create_user(self, mock_db):
        from app.models.user import User
        mock_db.fetchone.return_value = make_user_row()
        from app.crud.users import create_user
        user = User(userId=0, name="John Employee", email="employee@test.com",
                     password="test123", role="Employee")
        result = create_user(user)
        assert result.userId == 1
        args = mock_db.execute.call_args
        assert "INSERT INTO users" in args[0][0]
        assert "RETURNING" in args[0][0]

    def test_email_exists_true(self, mock_db):
        mock_db.fetchone.return_value = (1,)
        from app.crud.users import email_exists
        assert email_exists("employee@test.com") is True

    def test_email_exists_false(self, mock_db):
        mock_db.fetchone.return_value = None
        from app.crud.users import email_exists
        assert email_exists("nobody@test.com") is False


# ===================================================================
# CRUD: leave_types
# ===================================================================

class TestCrudLeaveTypes:
    def test_get_all_leave_types(self, mock_db):
        mock_db.fetchall.return_value = [
            make_leave_type_row(),
            make_leave_type_row(type_id=2, name="Personal"),
        ]
        from app.crud.leave_types import get_all_leave_types
        result = get_all_leave_types()
        assert len(result) == 2
        assert result[0].name == "Vacation"
        assert result[1].leaveTypeId == 2

    def test_get_leave_type_by_name_found(self, mock_db):
        mock_db.fetchone.return_value = make_leave_type_row()
        from app.crud.leave_types import get_leave_type_by_name
        lt = get_leave_type_by_name("vacation")
        assert lt.name == "Vacation"
        args = mock_db.execute.call_args
        assert "LOWER(name) = LOWER(%s)" in args[0][0]

    def test_get_leave_type_by_name_not_found(self, mock_db):
        mock_db.fetchone.return_value = None
        from app.crud.leave_types import get_leave_type_by_name
        assert get_leave_type_by_name("Sick") is None


# ===================================================================
# CRUD: leave_requests
# ===================================================================

class TestCrudLeaveRequests:
    def test_get_all_requests(self, mock_db):
        mock_db.fetchall.return_value = [make_request_row()]
        from app.crud.leave_requests import get_all_requests
        result = get_all_requests()
        assert len(result) == 1
        assert result[0].leaveType == "Vacation"

    def test_get_request_by_id_found(self, mock_db):
        mock_db.fetchone.return_value = make_request_row()
        from app.crud.leave_requests import get_request_by_id
        req = get_request_by_id(1)
        assert req.requestId == 1
        assert req.startDate == date(2027, 4, 10)

    def test_get_request_by_id_not_found(self, mock_db):
        mock_db.fetchone.return_value = None
        from app.crud.leave_requests import get_request_by_id
        assert get_request_by_id(999) is None

    def test_get_requests_by_user(self, mock_db):
        mock_db.fetchall.return_value = [make_request_row()]
        from app.crud.leave_requests import get_requests_by_user
        result = get_requests_by_user(1)
        assert len(result) == 1
        args = mock_db.execute.call_args
        assert "WHERE user_id = %s" in args[0][0]

    def test_get_requests_by_status(self, mock_db):
        mock_db.fetchall.return_value = [make_request_row()]
        from app.crud.leave_requests import get_requests_by_status
        result = get_requests_by_status("Pending")
        assert len(result) == 1
        args = mock_db.execute.call_args
        assert "WHERE status = %s" in args[0][0]

    def test_get_calendar_requests(self, mock_db):
        mock_db.fetchall.return_value = [
            {"request_id": 1, "user_id": 1, "start_date": date(2027, 4, 10),
             "end_date": date(2027, 4, 12), "status": "Pending"},
        ]
        from app.crud.leave_requests import get_calendar_requests
        result = get_calendar_requests()
        assert len(result) == 1
        assert result[0]["requestId"] == 1
        assert result[0]["status"] == "Pending"

    def test_create_request(self, mock_db):
        from app.models.leave_request import LeaveRequestCreate
        mock_db.fetchone.return_value = make_request_row()
        from app.crud.leave_requests import create_request
        data = LeaveRequestCreate(
            userId=1, leaveType="Vacation",
            startDate=date(2027, 4, 10), endDate=date(2027, 4, 12),
        )
        result = create_request(data)
        assert result.requestId == 1
        args = mock_db.execute.call_args
        assert "INSERT INTO leave_requests" in args[0][0]

    def test_update_request_with_fields(self, mock_db):
        mock_db.fetchone.return_value = make_request_row(status="Approved", reviewer_id=2)
        from app.crud.leave_requests import update_request
        result = update_request(1, status="Approved", reviewerId=2)
        assert result.status == "Approved"
        sql = mock_db.execute.call_args[0][0]
        assert "status = %s" in sql
        assert "reviewer_id = %s" in sql
        assert "updated_at = %s" in sql  # auto-appended

    def test_update_request_no_fields(self, mock_db):
        mock_db.fetchone.return_value = make_request_row()
        from app.crud.leave_requests import update_request
        result = update_request(1)
        assert result.requestId == 1
        # Should have called SELECT (get_request_by_id), not UPDATE
        sql = mock_db.execute.call_args[0][0]
        assert "SELECT" in sql

    def test_update_request_sets_null(self, mock_db):
        mock_db.fetchone.return_value = make_request_row(reviewer_id=None)
        from app.crud.leave_requests import update_request
        result = update_request(1, status="Pending", reviewerId=None)
        assert result.reviewerId is None
        params = mock_db.execute.call_args[0][1]
        assert None in params  # NULL for reviewer_id


# ===================================================================
# CRUD: leave_balances
# ===================================================================

class TestCrudLeaveBalances:
    def test_get_all_balances(self, mock_db):
        mock_db.fetchall.return_value = [make_balance_row()]
        from app.crud.leave_balances import get_all_balances
        result = get_all_balances()
        assert len(result) == 1
        assert result[0].totalDays == 10

    def test_get_balances_by_user(self, mock_db):
        mock_db.fetchall.return_value = [make_balance_row()]
        from app.crud.leave_balances import get_balances_by_user
        result = get_balances_by_user(1)
        assert len(result) == 1
        args = mock_db.execute.call_args
        assert "WHERE user_id = %s" in args[0][0]

    def test_get_balance_found(self, mock_db):
        mock_db.fetchone.return_value = make_balance_row()
        from app.crud.leave_balances import get_balance
        b = get_balance(1, 1, 2027)
        assert b.balanceId == 1
        assert b.usedDays == 2

    def test_get_balance_not_found(self, mock_db):
        mock_db.fetchone.return_value = None
        from app.crud.leave_balances import get_balance
        assert get_balance(1, 1, 2099) is None

    def test_update_used_days(self, mock_db):
        mock_db.fetchone.return_value = make_balance_row(used_days=5)
        from app.crud.leave_balances import update_used_days
        b = update_used_days(1, 5)
        assert b.usedDays == 5
        args = mock_db.execute.call_args
        assert "UPDATE leave_balances SET used_days = %s" in args[0][0]
        assert args[0][1] == (5, 1)


# ===================================================================
# CRUD: request_history
# ===================================================================

class TestCrudRequestHistory:
    def test_get_history_by_request(self, mock_db):
        mock_db.fetchall.return_value = [make_history_row()]
        from app.crud.request_history import get_history_by_request
        result = get_history_by_request(1)
        assert len(result) == 1
        assert result[0].action == "submitted"

    def test_get_all_history(self, mock_db):
        mock_db.fetchall.return_value = [make_history_row(), make_history_row(history_id=2, action="approved")]
        from app.crud.request_history import get_all_history
        result = get_all_history()
        assert len(result) == 2

    def test_create_history(self, mock_db):
        mock_db.fetchone.return_value = make_history_row()
        from app.crud.request_history import create_history
        h = create_history(1, "submitted", 1)
        assert h.historyId == 1
        args = mock_db.execute.call_args
        assert "INSERT INTO request_history" in args[0][0]
        assert args[0][1] == (1, "submitted", 1)
