from psycopg2.extras import RealDictCursor
from app.database import get_db
from app.models.leave_type import LeaveType


def _row_to_leave_type(row: dict) -> LeaveType:
    return LeaveType(
        leaveTypeId=row["type_id"],
        name=row["name"],
    )


def get_all_leave_types() -> list[LeaveType]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM leave_types ORDER BY type_id")
            return [_row_to_leave_type(row) for row in cur.fetchall()]


def get_leave_type_by_name(name: str) -> LeaveType | None:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM leave_types WHERE LOWER(name) = LOWER(%s)", (name,)
            )
            row = cur.fetchone()
            return _row_to_leave_type(row) if row else None
