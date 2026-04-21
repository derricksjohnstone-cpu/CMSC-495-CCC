import pytest
from datetime import date, timedelta
from pydantic import ValidationError

from app.models.leave_request import LeaveRequestCreate, LeaveRequest
from app.models.user import User


class TestLeaveRequestCreate:
    def _future(self, days=5):
        return date.today() + timedelta(days=days)

    def test_valid_request(self):
        req = LeaveRequestCreate(
            userId=1,
            leaveType="Vacation",
            startDate=self._future(5),
            endDate=self._future(7),
        )
        assert req.status == "Pending"
        assert req.leaveMode == "Full Day"
        assert req.description is None

    def test_start_date_in_past(self):
        with pytest.raises(ValidationError, match="startDate cannot be in the past"):
            LeaveRequestCreate(
                userId=1,
                leaveType="Vacation",
                startDate=date.today() - timedelta(days=1),
                endDate=date.today(),
            )

    def test_end_before_start(self):
        with pytest.raises(ValidationError, match="endDate cannot be before startDate"):
            LeaveRequestCreate(
                userId=1,
                leaveType="Vacation",
                startDate=self._future(5),
                endDate=self._future(3),
            )

    def test_half_day_multi_day_rejected(self):
        with pytest.raises(ValidationError, match="Half Day leave must be a single-day"):
            LeaveRequestCreate(
                userId=1,
                leaveType="Personal",
                startDate=self._future(5),
                endDate=self._future(6),
                leaveMode="Half Day",
            )

    def test_half_day_single_day_ok(self):
        d = self._future(5)
        req = LeaveRequestCreate(
            userId=1,
            leaveType="Personal",
            startDate=d,
            endDate=d,
            leaveMode="Half Day",
        )
        assert req.leaveMode == "Half Day"


class TestUserModel:
    def test_defaults(self):
        user = User(
            userId=1, name="Test", email="t@t.com", password="pw", role="Employee"
        )
        assert user.managerId is None
        assert user.department is None
        assert user.profileImage is None

    def test_all_fields(self):
        user = User(
            userId=1, name="Test", email="t@t.com", password="pw",
            role="Manager", managerId=2, department="IT", profileImage="pic.png",
        )
        assert user.managerId == 2
        assert user.profileImage == "pic.png"
