from fastapi import APIRouter
from app.crud import leave_types as leave_types_crud

router = APIRouter(prefix="/leave-types", tags=["Leave Types"])


@router.get("/")
def get_leave_types():
    return leave_types_crud.get_all_leave_types()