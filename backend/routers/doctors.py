from fastapi import APIRouter, Depends, HTTPException

from schemas import DoctorCreate

import models

from dependencies import require_role


router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)


# ==========================
# Get all doctors
# ==========================

@router.get("/")
def get_all_doctors(
    current_user=Depends(
        require_role(
            [
                "SuperAdmin",
                "HospitalAdmin",
                "Receptionist",
                "Doctor"
            ]
        )
    )
):

    doctors = models.get_doctors(
        current_user["hospital_id"]
    )

    return {
        "doctors": doctors
    }


# ==========================
# Create doctor
# ==========================

@router.post("/")
def add_doctor(
    doctor: DoctorCreate,
    current_user=Depends(
        require_role(
            [
                "SuperAdmin",
                "HospitalAdmin"
            ]
        )
    )
):

    doctor_id = models.create_doctor(
        current_user["hospital_id"],
        doctor.department_id,
        doctor.full_name,
        doctor.qualification,
        doctor.phone,
        doctor.email,
        doctor.password,
        doctor.consultation_fee,
        doctor.status
    )

    return {
        "message": "Doctor created successfully",
        "doctor_id": doctor_id
    }


# ==========================
# Update doctor
# ==========================

@router.put("/{doctor_id}")
def update_doctor(
    doctor_id: int,
    doctor: DoctorCreate,
    current_user=Depends(
        require_role(
            [
                "SuperAdmin",
                "HospitalAdmin"
            ]
        )
    )
):

    affected_rows = models.update_doctor(
        doctor_id,
        current_user["hospital_id"],
        doctor.department_id,
        doctor.full_name,
        doctor.qualification,
        doctor.phone,
        doctor.email,
        doctor.consultation_fee,
        doctor.status
    )

    if affected_rows == 0:

        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    return {
        "message": "Doctor updated successfully"
    }


# ==========================
# Deactivate doctor
# ==========================

@router.delete("/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    current_user=Depends(
        require_role(
            [
                "SuperAdmin",
                "HospitalAdmin"
            ]
        )
    )
):

    affected_rows = models.deactivate_doctor(
        doctor_id,
        current_user["hospital_id"]
    )

    if affected_rows == 0:

        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    return {
        "message": "Doctor deactivated successfully"
    }


# ==========================
# Public doctors
# ==========================

@router.get("/public/{hospital_id}")
def public_doctors(
    hospital_id: int
):

    doctors = models.get_doctors(
        hospital_id
    )

    return {
        "doctors": doctors
    }
