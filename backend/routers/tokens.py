from fastapi import APIRouter, Depends

from schemas import TokenCreate

import models

from dependencies import require_role


router = APIRouter(
    prefix="/tokens",
    tags=["Tokens"]
)


# =========================================================
# GET ALL TOKENS
# =========================================================

@router.get("/")
def get_all_tokens(
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

    tokens = models.get_tokens(
        current_user["hospital_id"]
    )

    return {
        "tokens": tokens
    }


# =========================================================
# CREATE TOKEN
# =========================================================

@router.post("/")
def add_token(
    token: TokenCreate,

    current_user=Depends(
        require_role(
            [
                "SuperAdmin",
                "HospitalAdmin",
                "Receptionist"
            ]
        )
    )
):

    appointment = models.get_appointment_details(
        token.appointment_id
    )

    if not appointment:

        return {
            "message": "Appointment not found"
        }


    # =====================================================
    # GENERATE TOKEN NUMBER
    # =====================================================

    token_number = models.generate_token_number(

        current_user["hospital_id"],

        appointment["doctor_id"],

        appointment["appointment_date"]

    )


    # =====================================================
    # CREATE TOKEN
    # =====================================================

    token_id = models.create_token(

        current_user["hospital_id"],

        token.appointment_id,

        appointment["doctor_id"],

        appointment["appointment_date"],

        token_number,

        token.token_status

    )


    return {

        "message": "Token created successfully",

        "token_id": token_id,

        "token_number": token_number

    }


# =========================================================
# SERVE NEXT WAITING TOKEN
# =========================================================

@router.put("/next")
def serve_next_token(

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

    token = models.serve_next_token(

        current_user["hospital_id"],

        current_user.get("doctor_id")

    )


    if not token:

        return {

            "message": "No waiting token for today",

            "token": None

        }


    return {

        "message": "Next patient called",

        "token": token

    }


# =========================================================
# COMPLETE TOKEN
# =========================================================

@router.put("/{token_id}/complete")
def complete_token(

    token_id: int,

    current_user=Depends(
        require_role(
            [
                "SuperAdmin",
                "HospitalAdmin",
                "Doctor"
            ]
        )
    )

):

    result = models.complete_token(

        token_id,

        current_user["hospital_id"]

    )


    return {

        "message": "Patient consultation completed",

        "updated": result

    }


# =========================================================
# TOKEN DASHBOARD
# =========================================================

@router.get("/dashboard")
def token_dashboard(

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

    dashboard = models.get_token_dashboard(

        current_user["hospital_id"]

    )


    return dashboard


# =========================================================
# CALL NEXT PATIENT - DOCTOR WISE
# =========================================================

@router.put("/next-patient/{doctor_id}")
def call_next_patient(

    doctor_id: int,

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

    # =====================================================
    # DOCTOR SECURITY CHECK
    # =====================================================

    if current_user["role"] == "Doctor":

        if current_user.get("doctor_id") != doctor_id:

            return {
                "message": "Doctor access denied",
                "token": None
            }


    token = models.serve_next_token(

        current_user["hospital_id"],

        doctor_id

    )


    if not token:

        return {

            "message": "No waiting token for today",

            "token": None

        }


    return {

        "message": "Next patient called",

        "token": token

    }


# =========================================================
# LIVE TOKEN DISPLAY
# =========================================================

@router.get("/display/{hospital_id}")
def live_token_display(

    hospital_id: int

):

    token = models.get_live_token(

        hospital_id

    )


    return token


# =========================================================
# PATIENT TOKEN STATUS
# =========================================================

@router.get("/{token_id}/status")
def patient_token_status(

    token_id: int,

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

    status = models.get_patient_token_status(

        token_id,

        current_user["hospital_id"]

    )


    return status


# =========================================================
# PUBLIC TOKEN DISPLAY - DOCTOR WISE
# =========================================================

@router.get("/public/{hospital_id}/{doctor_id}")
def public_token_display(

    hospital_id: int,

    doctor_id: int

):

    display = models.get_public_token_display(

        hospital_id,

        doctor_id

    )


    return display


# =========================================================
# DOCTOR TODAY'S PATIENTS
# =========================================================

@router.get("/doctor/patients")
def doctor_patients(

    current_user=Depends(
        require_role(
            [
                "SuperAdmin",
                "HospitalAdmin",
                "Doctor"
            ]
        )
    )

):

    # =====================================================
    # DOCTOR ID
    # =====================================================

    doctor_id = current_user.get(
        "doctor_id"
    )


    # =====================================================
    # DOCTOR VALIDATION
    # =====================================================

    if current_user["role"] == "Doctor":

        if doctor_id is None:

            return {
                "patients": []
            }


    patients = models.get_doctor_today_patients(

        current_user["hospital_id"],

        doctor_id

    )


    return {

        "patients": patients

    }
