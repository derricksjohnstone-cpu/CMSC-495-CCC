from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.users import router as user_router
from app.routes.leave_requests import router as request_router
from app.routes.leave_types import router as leave_type_router
from app.routes.leave_balances import router as leave_balance_router
from app.routes.manager import router as manager_router
from app.routes.auth import router as auth_router

app = FastAPI(title="Leave Request Approval System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(request_router)
app.include_router(leave_type_router)
app.include_router(leave_balance_router)
app.include_router(manager_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "Leave Request Approval System API"}