from app.models.user import User

users_db = [
    User(
        userId=1,
        name="John Employee",
        email="employee@test.com",
        password="test123",
        role="Employee",
        department="IT",
        profileImage=None
    ),
    User(
        userId=2,
        name="Sarah Manager",
        email="manager@test.com",
        password="test123",
        role="Manager",
        department="IT",
        profileImage=None
    )
]