from fastapi import APIRouter
from app.data.leave_types_data import leave_types_db

router = APIRouter(prefix="/leave-types", tags=["Leave Types"])


@router.get("/")
def get_leave_types():
    return leave_types_db