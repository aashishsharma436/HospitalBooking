from fastapi import APIRouter, Depends

from schemas import PatientCreate

import models

from dependencies import require_role


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.get("/")
def get_all_patients(
    current_user = Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin", "Receptionist", "Doctor"]
        )
    )
):

    patients = models.get_patients(
        current_user["hospital_id"]
    )

    return patients


@router.post("/")
def add_patient(
    patient: PatientCreate,
    current_user = Depends(
        require_role(
            ["SuperAdmin", "HospitalAdmin", "Receptionist"]
        )
    )
):

    patient_id = models.create_patient(
        current_user["hospital_id"],
        patient.full_name,
        patient.gender,
        patient.date_of_birth,
        patient.phone,
        patient.email,
        patient.address,
        patient.emergency_contact,
        patient.blood_group
    )

    return {
        "message": "Patient created successfully",
        "patient_id": patient_id
    }
