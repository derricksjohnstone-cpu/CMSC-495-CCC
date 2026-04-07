from psycopg2.extras import RealDictCursor
from app.database import get_db
from app.models.leave_balance import LeaveBalance


def _row_to_balance(row: dict) -> LeaveBalance:
    return LeaveBalance(
        balanceId=row["balance_id"],
        userId=row["user_id"],
        leaveTypeId=row["leave_type_id"],
        totalDays=row["total_days"],
        usedDays=row["used_days"],
        year=row["year"],
    )


def get_all_balances() -> list[LeaveBalance]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM leave_balances ORDER BY balance_id")
            return [_row_to_balance(row) for row in cur.fetchall()]


def get_balances_by_user(user_id: int) -> list[LeaveBalance]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM leave_balances WHERE user_id = %s ORDER BY balance_id",
                (user_id,),
            )
            return [_row_to_balance(row) for row in cur.fetchall()]


def get_balance(user_id: int, leave_type_id: int, year: int) -> LeaveBalance | None:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT * FROM leave_balances
                   WHERE user_id = %s AND leave_type_id = %s AND year = %s""",
                (user_id, leave_type_id, year),
            )
            row = cur.fetchone()
            return _row_to_balance(row) if row else None


def update_used_days(balance_id: int, used_days: int) -> LeaveBalance | None:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """UPDATE leave_balances SET used_days = %s
                   WHERE balance_id = %s RETURNING *""",
                (used_days, balance_id),
            )
            row = cur.fetchone()
            return _row_to_balance(row) if row else None
