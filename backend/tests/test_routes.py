"""Route tests using FastAPI TestClient with mocked CRUD layer."""
import pytest
from datetime import date, datetime
from unittest.mock import patch, MagicMock

from tests.conftest import make_user, make_request, make_balance, make_leave_type, make_history


# ===================================================================
# Auth routes
# ===================================================================

class TestAuthRoutes:
    @patch("app.routes.auth.users_crud")
    def test_login_success(self, mock_crud, client):
        mock_crud.get_user_by_email.return_value = make_user()
        resp = client.post("/auth/login", json={"email": "employee@test.com", "password": "test123"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["message"] == "Login successful"
        assert data["user"]["email"] == "employee@test.com"

    @patch("app.routes.auth.users_crud")
    def test_login_wrong_password(self, mock_crud, client):
        mock_crud.get_user_by_email.return_value = make_user()
        resp = client.post("/auth/login", json={"email": "employee@test.com", "password": "wrong"})
        assert resp.status_code == 401

    @patch("app.routes.auth.users_crud")
    def test_login_unknown_email(self, mock_crud, client):
        mock_crud.get_user_by_email.return_value = None
        resp = client.post("/auth/login", json={"email": "nobody@test.com", "password": "test123"})
        assert resp.status_code == 401


# ===================================================================
# User routes
# ===================================================================

class TestUserRoutes:
    @patch("app.routes.users.users_crud")
    def test_get_users(self, mock_crud, client):
        mock_crud.get_all_users.return_value = [make_user()]
        resp = client.get("/users/")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    @patch("app.routes.users.users_crud")
    def test_create_user_success(self, mock_crud, client):
        mock_crud.email_exists.return_value = False
        mock_crud.create_user.return_value = make_user()
        resp = client.post("/users/", json={
            "userId": 0, "name": "New User", "email": "new@test.com",
            "password": "pw", "role": "Employee",
        })
        assert resp.status_code == 200
        assert resp.json()["message"] == "User created"

    @patch("app.routes.users.users_crud")
    def test_create_user_duplicate_email(self, mock_crud, client):
        mock_crud.email_exists.return_value = True
        resp = client.post("/users/", json={
            "userId": 0, "name": "Dup", "email": "employee@test.com",
            "password": "pw", "role": "Employee",
        })
        assert resp.status_code == 400
        assert "Email already exists" in resp.json()["detail"]

    @patch("app.routes.users.users_crud")
    def test_get_user_by_id_found(self, mock_crud, client):
        mock_crud.get_user_by_id.return_value = make_user()
        resp = client.get("/users/1")
        assert resp.status_code == 200
        assert resp.json()["name"] == "John Employee"

    @patch("app.routes.users.users_crud")
    def test_get_user_by_id_not_found(self, mock_crud, client):
        mock_crud.get_user_by_id.return_value = None
        resp = client.get("/users/999")
        assert resp.status_code == 404

    @patch("app.routes.users.leave_requests_crud")
    def test_get_user_requests(self, mock_crud, client):
        mock_crud.get_requests_by_user.return_value = [make_request()]
        resp = client.get("/users/1/requests")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    @patch("app.routes.users.leave_balances_crud")
    def test_get_user_balances(self, mock_crud, client):
        mock_crud.get_balances_by_user.return_value = [make_balance()]
        resp = client.get("/users/1/balances")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


# ===================================================================
# Leave type routes
# ===================================================================

class TestLeaveTypeRoutes:
    @patch("app.routes.leave_types.leave_types_crud")
    def test_get_leave_types(self, mock_crud, client):
        mock_crud.get_all_leave_types.return_value = [
            make_leave_type(), make_leave_type(leaveTypeId=2, name="Personal"),
        ]
        resp = client.get("/leave-types/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


# ===================================================================
# Leave balance routes
# ===================================================================

class TestLeaveBalanceRoutes:
    @patch("app.routes.leave_balances.leave_balances_crud")
    def test_get_balances(self, mock_crud, client):
        mock_crud.get_all_balances.return_value = [make_balance()]
        resp = client.get("/balances/")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


# ===================================================================
# Manager routes
# ===================================================================

class TestManagerRoutes:
    @patch("app.routes.manager.leave_requests_crud")
    def test_get_pending_requests(self, mock_crud, client):
        mock_crud.get_requests_by_status.return_value = [make_request()]
        resp = client.get("/manager/requests/pending")
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        mock_crud.get_requests_by_status.assert_called_with("Pending")

    @patch("app.routes.manager.leave_requests_crud")
    def test_get_calendar(self, mock_crud, client):
        mock_crud.get_calendar_requests.return_value = [
            {"requestId": 1, "userId": 1, "startDate": "2027-04-10",
             "endDate": "2027-04-12", "status": "Pending"},
        ]
        resp = client.get("/manager/calendar")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


# ===================================================================
# Leave request routes
# ===================================================================

class TestLeaveRequestRoutes:
    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_get_requests(self, mock_crud, client):
        mock_crud.get_all_requests.return_value = [make_request()]
        resp = client.get("/requests/")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_get_request_by_id(self, mock_crud, client):
        mock_crud.get_request_by_id.return_value = make_request()
        resp = client.get("/requests/1")
        assert resp.status_code == 200
        assert resp.json()["requestId"] == 1

    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_get_request_not_found(self, mock_crud, client):
        mock_crud.get_request_by_id.return_value = None
        resp = client.get("/requests/999")
        assert resp.status_code == 404

    @patch("app.routes.leave_requests.request_history_crud")
    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_create_request(self, mock_req_crud, mock_hist_crud, client):
        created = make_request()
        mock_req_crud.create_request.return_value = created
        mock_hist_crud.create_history.return_value = make_history()

        resp = client.post("/requests/", json={
            "userId": 1, "leaveType": "Vacation",
            "startDate": "2027-04-10", "endDate": "2027-04-12",
        })
        assert resp.status_code == 200
        assert resp.json()["message"] == "Leave request created"
        mock_hist_crud.create_history.assert_called_once_with(
            request_id=1, action="submitted", performed_by=1,
        )

    # --- Approve ---

    @patch("app.routes.leave_requests.request_history_crud")
    @patch("app.routes.leave_requests.leave_balances_crud")
    @patch("app.routes.leave_requests.leave_types_crud")
    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_approve_success(self, mock_req, mock_types, mock_bal, mock_hist, client):
        mock_req.get_request_by_id.return_value = make_request(status="Pending")
        mock_types.get_leave_type_by_name.return_value = make_leave_type()
        mock_bal.get_balance.return_value = make_balance(totalDays=10, usedDays=0)
        mock_req.update_request.return_value = make_request(status="Approved", reviewerId=2)
        mock_bal.update_used_days.return_value = make_balance(usedDays=3)
        mock_hist.create_history.return_value = make_history(action="approved")

        resp = client.put("/requests/1/approve?reviewerId=2")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Leave request approved"
        mock_bal.update_used_days.assert_called_once()
        mock_hist.create_history.assert_called_once()

    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_approve_not_found(self, mock_crud, client):
        mock_crud.get_request_by_id.return_value = None
        resp = client.put("/requests/999/approve?reviewerId=2")
        assert resp.status_code == 404

    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_approve_not_pending(self, mock_crud, client):
        mock_crud.get_request_by_id.return_value = make_request(status="Approved")
        resp = client.put("/requests/1/approve?reviewerId=2")
        assert resp.status_code == 400
        assert "Only pending" in resp.json()["detail"]

    @patch("app.routes.leave_requests.leave_types_crud")
    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_approve_no_balance(self, mock_req, mock_types, client):
        mock_req.get_request_by_id.return_value = make_request(status="Pending")
        mock_types.get_leave_type_by_name.return_value = None
        resp = client.put("/requests/1/approve?reviewerId=2")
        assert resp.status_code == 404
        assert "balance not found" in resp.json()["detail"]

    @patch("app.routes.leave_requests.leave_balances_crud")
    @patch("app.routes.leave_requests.leave_types_crud")
    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_approve_insufficient_balance(self, mock_req, mock_types, mock_bal, client):
        mock_req.get_request_by_id.return_value = make_request(status="Pending")
        mock_types.get_leave_type_by_name.return_value = make_leave_type()
        mock_bal.get_balance.return_value = make_balance(totalDays=1, usedDays=1)
        resp = client.put("/requests/1/approve?reviewerId=2")
        assert resp.status_code == 400
        assert "Insufficient" in resp.json()["detail"]

    # --- Reject ---

    @patch("app.routes.leave_requests.request_history_crud")
    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_reject_success(self, mock_req, mock_hist, client):
        mock_req.get_request_by_id.return_value = make_request(status="Pending")
        mock_req.update_request.return_value = make_request(status="Rejected", comments="No")
        mock_hist.create_history.return_value = make_history(action="rejected")

        resp = client.put("/requests/1/reject?comments=No&reviewerId=2")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Leave request rejected"

    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_reject_not_pending(self, mock_crud, client):
        mock_crud.get_request_by_id.return_value = make_request(status="Approved")
        resp = client.put("/requests/1/reject?comments=No&reviewerId=2")
        assert resp.status_code == 400

    # --- Revision ---

    @patch("app.routes.leave_requests.request_history_crud")
    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_revision_success(self, mock_req, mock_hist, client):
        mock_req.get_request_by_id.return_value = make_request(status="Pending")
        mock_req.update_request.return_value = make_request(status="Revision Requested")
        mock_hist.create_history.return_value = make_history(action="revision requested")

        resp = client.put("/requests/1/revision?comments=Fix+dates&reviewerId=2")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Revision requested"

    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_revision_not_pending(self, mock_crud, client):
        mock_crud.get_request_by_id.return_value = make_request(status="Rejected")
        resp = client.put("/requests/1/revision?comments=Fix&reviewerId=2")
        assert resp.status_code == 400

    # --- Resubmit ---

    @patch("app.routes.leave_requests.request_history_crud")
    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_resubmit_success(self, mock_req, mock_hist, client):
        mock_req.get_request_by_id.return_value = make_request(status="Revision Requested")
        mock_req.update_request.return_value = make_request(status="Pending", reviewerId=None)
        mock_hist.create_history.return_value = make_history(action="resubmitted")

        resp = client.put("/requests/1/resubmit")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Leave request resubmitted"
        mock_req.update_request.assert_called_with(1, status="Pending", reviewerId=None)

    @patch("app.routes.leave_requests.leave_requests_crud")
    def test_resubmit_wrong_status(self, mock_crud, client):
        mock_crud.get_request_by_id.return_value = make_request(status="Pending")
        resp = client.put("/requests/1/resubmit")
        assert resp.status_code == 400
        assert "Only revision requested" in resp.json()["detail"]

    # --- History ---

    @patch("app.routes.leave_requests.request_history_crud")
    def test_get_request_history(self, mock_crud, client):
        mock_crud.get_history_by_request.return_value = [make_history()]
        resp = client.get("/requests/1/history")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    @patch("app.routes.leave_requests.request_history_crud")
    def test_get_request_history_empty(self, mock_crud, client):
        mock_crud.get_history_by_request.return_value = []
        resp = client.get("/requests/1/history")
        assert resp.status_code == 404

    @patch("app.routes.leave_requests.request_history_crud")
    def test_get_all_history(self, mock_crud, client):
        mock_crud.get_all_history.return_value = [make_history(), make_history(historyId=2)]
        resp = client.get("/requests/history/all")
        assert resp.status_code == 200
        assert len(resp.json()) == 2


# ===================================================================
# Helper function tests
# ===================================================================

class TestHelperFunctions:
    def test_calculate_days_full_day(self):
        from app.routes.leave_requests import calculate_requested_days
        assert calculate_requested_days(date(2027, 4, 10), date(2027, 4, 12), "Full Day") == 3

    def test_calculate_days_half_day(self):
        from app.routes.leave_requests import calculate_requested_days
        assert calculate_requested_days(date(2027, 4, 10), date(2027, 4, 10), "Half Day") == 0.5

    def test_calculate_days_single_full_day(self):
        from app.routes.leave_requests import calculate_requested_days
        assert calculate_requested_days(date(2027, 4, 10), date(2027, 4, 10), "Full Day") == 1

    @patch("app.routes.leave_requests.leave_types_crud")
    def test_find_matching_balance_no_type(self, mock_types):
        mock_types.get_leave_type_by_name.return_value = None
        from app.routes.leave_requests import find_matching_balance
        assert find_matching_balance(1, "Nonexistent", 2027) is None
