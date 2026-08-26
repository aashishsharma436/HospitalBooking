from fastapi import APIRouter
import models


router = APIRouter(
    prefix="/hospital-dashboard",
    tags=["Hospital Dashboard"]
)


@router.get("/{hospital_id}")
def dashboard_data(hospital_id: int):

    data = models.get_hospital_dashboard(
        hospital_id
    )

    return data
