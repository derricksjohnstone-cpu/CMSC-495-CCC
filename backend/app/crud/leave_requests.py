from datetime import datetime
from psycopg2.extras import RealDictCursor
from app.database import get_db
from app.models.leave_request import LeaveRequest, LeaveRequestCreate


def _row_to_request(row: dict) -> LeaveRequest:
    return LeaveRequest(
        requestId=row["request_id"],
        userId=row["user_id"],
        reviewerId=row.get("reviewer_id"),
        leaveType=row["leave_type"],
        startDate=row["start_date"],
        endDate=row["end_date"],
        leaveMode=row.get("leave_mode", "Full Day"),
        description=row.get("description"),
        status=row.get("status", "Pending"),
        comments=row.get("comments"),
        createdAt=row.get("created_at", datetime.now()),
        updatedAt=row.get("updated_at", datetime.now()),
    )


def get_all_requests() -> list[LeaveRequest]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM leave_requests ORDER BY request_id")
            return [_row_to_request(row) for row in cur.fetchall()]


def get_request_by_id(request_id: int) -> LeaveRequest | None:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM leave_requests WHERE request_id = %s", (request_id,)
            )
            row = cur.fetchone()
            return _row_to_request(row) if row else None


def get_requests_by_user(user_id: int) -> list[LeaveRequest]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM leave_requests WHERE user_id = %s ORDER BY request_id",
                (user_id,),
            )
            return [_row_to_request(row) for row in cur.fetchall()]


def get_requests_by_status(status: str) -> list[LeaveRequest]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM leave_requests WHERE status = %s ORDER BY request_id",
                (status,),
            )
            return [_row_to_request(row) for row in cur.fetchall()]


def get_calendar_requests() -> list[dict]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT request_id, user_id, start_date, end_date, status
                   FROM leave_requests
                   WHERE status IN ('Approved', 'Pending')
                   ORDER BY start_date"""
            )
            return [
                {
                    "requestId": row["request_id"],
                    "userId": row["user_id"],
                    "startDate": row["start_date"],
                    "endDate": row["end_date"],
                    "status": row["status"],
                }
                for row in cur.fetchall()
            ]


def create_request(data: LeaveRequestCreate) -> LeaveRequest:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO leave_requests
                   (user_id, leave_type, start_date, end_date, leave_mode, description, status)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   RETURNING *""",
                (
                    data.userId,
                    data.leaveType,
                    data.startDate,
                    data.endDate,
                    data.leaveMode,
                    data.description,
                    "Pending",
                ),
            )
            return _row_to_request(cur.fetchone())


def update_request(request_id: int, **fields) -> LeaveRequest | None:
    if not fields:
        return get_request_by_id(request_id)

    # Map camelCase field names to snake_case DB columns
    field_map = {
        "status": "status",
        "reviewerId": "reviewer_id",
        "comments": "comments",
        "updatedAt": "updated_at",
    }

    set_clauses = []
    values = []
    for key, value in fields.items():
        col = field_map.get(key, key)
        set_clauses.append(f"{col} = %s")
        values.append(value)

    # Always update updated_at
    if "updatedAt" not in fields and "updated_at" not in fields:
        set_clauses.append("updated_at = %s")
        values.append(datetime.now())

    values.append(request_id)

    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"""UPDATE leave_requests
                    SET {', '.join(set_clauses)}
                    WHERE request_id = %s
                    RETURNING *""",
                values,
            )
            row = cur.fetchone()
            return _row_to_request(row) if row else None
