from psycopg2.extras import RealDictCursor
from app.database import get_db
from app.models.user import User


def _row_to_user(row: dict) -> User:
    return User(
        userId=row["user_id"],
        name=row["name"],
        email=row["email"],
        password=row["password"],
        role=row["role"],
        managerId=row.get("manager_id"),
        department=row.get("department"),
        profileImage=row.get("profile_image"),
    )


def get_all_users() -> list[User]:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users ORDER BY user_id")
            return [_row_to_user(row) for row in cur.fetchall()]


def get_user_by_id(user_id: int) -> User | None:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
            row = cur.fetchone()
            return _row_to_user(row) if row else None


def get_user_by_email(email: str) -> User | None:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            row = cur.fetchone()
            return _row_to_user(row) if row else None


def create_user(user: User) -> User:
    with get_db() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO users (name, email, password, role, manager_id, department, profile_image)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   RETURNING *""",
                (user.name, user.email, user.password, user.role,
                 user.managerId, user.department, user.profileImage),
            )
            return _row_to_user(cur.fetchone())


def email_exists(email: str) -> bool:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM users WHERE email = %s", (email,))
            return cur.fetchone() is not None
