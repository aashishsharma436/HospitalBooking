from fastapi import APIRouter, Depends

from schemas import AppointmentCreate, PublicAppointmentCreate

import models

from dependencies import require_role


router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)


# =========================================================
# GET ALL APPOINTMENTS
# =========================================================

@router.get("/")
def get_all_appointments(

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

    appointments = models.get_appointments(
        current_user["hospital_id"]
    )

    return {
        "appointments": appointments
    }


# =========================================================
# CREATE APPOINTMENT + AUTO TOKEN GENERATION
# =========================================================

@router.post("/")
def add_appointment(

    appointment: AppointmentCreate,

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

    hospital_id = current_user["hospital_id"]


    # =====================================================
    # Create Appointment
    # =====================================================

    appointment_id = models.create_appointment(

        hospital_id,

        appointment.patient_id,

        appointment.doctor_id,

        appointment.appointment_date,

        appointment.appointment_time,

        appointment.appointment_status,

        appointment.booking_source,

        appointment.notes

    )


    # =====================================================
    # Generate Token Number
    # =====================================================

    token_number = models.generate_token_number(

        hospital_id,

        appointment.doctor_id,

        appointment.appointment_date

    )


    # =====================================================
    # Create Token
    # =====================================================

    token_id = models.create_token(

        hospital_id,

        appointment_id,

        appointment.doctor_id,

        appointment.appointment_date,

        token_number,

        "Waiting"

    )


    # =====================================================
    # Response
    # =====================================================

    return {

        "message": "Appointment created successfully",

        "appointment_id": appointment_id,

        "token_id": token_id,

        "token_number": token_number

    }


# =========================================================
# PUBLIC APPOINTMENT BOOKING
# =========================================================

@router.post("/public")
def public_booking(

    appointment: PublicAppointmentCreate

):

    # =====================================================
    # Check Duplicate Booking
    # =====================================================

    existing_booking = models.check_duplicate_booking(

        appointment.hospital_id,

        appointment.phone,

        appointment.appointment_date

    )


    if existing_booking:

        return {

            "message":
            "You already have an appointment booked for this date"

        }


    # =====================================================
    # Create Patient
    # =====================================================

    patient_id = models.create_patient(

        appointment.hospital_id,

        appointment.patient_name,

        appointment.gender,

        appointment.date_of_birth,

        appointment.phone,

        None,

        None,

        None,

        None

    )


    # =====================================================
    # Create Appointment
    # =====================================================

    appointment_id = models.create_appointment(

        appointment.hospital_id,

        patient_id,

        appointment.doctor_id,

        appointment.appointment_date,

        None,

        "Booked",

        "Website",

        None

    )


    # =====================================================
    # Generate Token Number
    # =====================================================

    token_number = models.generate_token_number(

        appointment.hospital_id,

        appointment.doctor_id,

        appointment.appointment_date

    )


    # =====================================================
    # Create Token
    # =====================================================

    token_id = models.create_token(

        appointment.hospital_id,

        appointment_id,

        appointment.doctor_id,

        appointment.appointment_date,

        token_number,

        "Waiting"

    )


    # =====================================================
    # Response
    # =====================================================

    return {

        "message":
        "Appointment booked successfully",

        "appointment_id":
        appointment_id,

        "token_id":
        token_id,

        "token_number":
        token_number

    }
