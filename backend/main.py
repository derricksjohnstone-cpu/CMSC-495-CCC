from fastapi import FastAPI
from app.routes.leave_requests import router as request_router
from app.routes.users import router as user_router

app = FastAPI()

app.include_router(request_router)
app.include_router(user_router)

@app.get("/")
def root():
    return {"message": "Leave Request Approval System API"}