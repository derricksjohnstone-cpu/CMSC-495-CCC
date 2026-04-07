from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import init_pool, close_pool
from app.routes.users import router as user_router
from app.routes.leave_requests import router as request_router
from app.routes.leave_types import router as leave_type_router
from app.routes.leave_balances import router as leave_balance_router
from app.routes.manager import router as manager_router
from app.routes.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_pool()
    yield
    close_pool()


app = FastAPI(title="Leave Request Approval System API", lifespan=lifespan)

app.include_router(user_router)
app.include_router(request_router)
app.include_router(leave_type_router)
app.include_router(leave_balance_router)
app.include_router(manager_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "Leave Request Approval System API"}