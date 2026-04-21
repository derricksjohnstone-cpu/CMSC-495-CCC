from psycopg2.extras import RealDictCursor
from app.database import get_db
from app.models.request_history import RequestHistory


def _row_to_history(row: dict) -> RequestHistory:
    return RequestHistory(
        historyId=row["history_id"],
        requestId=row["request_id"],
        action=row["action"],
        timestamp=row["timestamp"],
        performedBy=row.get("performed_by"),
    )


def get_history_by_request(request_id: int) -> list[RequestHistory]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT * FROM request_history
                   WHERE request_id = %s ORDER BY timestamp""",
                (request_id,),
            )
            return [_row_to_history(row) for row in cur.fetchall()]


def get_all_history() -> list[RequestHistory]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM request_history ORDER BY timestamp")
            return [_row_to_history(row) for row in cur.fetchall()]


def create_history(
    request_id: int, action: str, performed_by: int | None
) -> RequestHistory:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO request_history (request_id, action, performed_by)
                   VALUES (%s, %s, %s) RETURNING *""",
                (request_id, action, performed_by),
            )
            return _row_to_history(cur.fetchone())
