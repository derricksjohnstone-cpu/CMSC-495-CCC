from app.models.leave_balance import LeaveBalance

leave_balances_db = [
    LeaveBalance(balanceId=1, userId=1, leaveTypeId=1, totalDays=10, usedDays=2, year=2026),
    LeaveBalance(balanceId=2, userId=1, leaveTypeId=2, totalDays=5, usedDays=1, year=2026)
]