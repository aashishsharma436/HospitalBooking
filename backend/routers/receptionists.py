from fastapi import APIRouter, Depends, HTTPException

from pydantic import BaseModel

import models

from dependencies import require_role


router = APIRouter(
    prefix="/receptionists",
    tags=["Receptionists"]
)


# ==========================
# Receptionist Schema
# ==========================

class ReceptionistCreate(BaseModel):

    full_name: str
    email: str
    phone: str | None = None
    password: str
    status: str = "Active"


# ==========================
# Get All Receptionists
# ==========================

@router.get("/")
def get_all_receptionists(

    current_user=Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin"]
        )
    )

):

    receptionists = models.get_receptionists(
        current_user["hospital_id"]
    )

    return {

        "receptionists": receptionists

    }


# ==========================
# Create Receptionist
# ==========================

@router.post("/")
def create_receptionist(

    receptionist: ReceptionistCreate,

    current_user=Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin"]
        )
    )

):

    receptionist_id = models.create_receptionist(

        current_user["hospital_id"],

        receptionist.full_name,

        receptionist.email,

        receptionist.phone,

        receptionist.password,

        receptionist.status

    )

    return {

        "message": "Receptionist created successfully",

        "receptionist_id": receptionist_id

    }


# ==========================
# Deactivate Receptionist
# ==========================

@router.delete("/{receptionist_id}")
def deactivate_receptionist(

    receptionist_id: int,

    current_user=Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin"]
        )
    )

):

    affected_rows = models.deactivate_receptionist(

        receptionist_id,

        current_user["hospital_id"]

    )

    if affected_rows == 0:

        raise HTTPException(
            status_code=404,
            detail="Receptionist not found"
        )

    return {

        "message": "Receptionist deactivated successfully"

    }
