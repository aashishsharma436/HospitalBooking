from pydantic import BaseModel
from typing import Optional


#Patient Schema

class PatientCreate(BaseModel):
    full_name: str
    gender: str
    date_of_birth: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None


# Doctor Schema

class DoctorCreate(BaseModel):
    department_id: int
    full_name: str
    qualification: Optional[str] = None
    phone: Optional[str] = None
    email: str
    password: str
    consultation_fee: Optional[float] = None
    status: Optional[str] = "Active"


# Appointment Schema

class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: str
    appointment_time: str
    appointment_status: Optional[str] = "Booked"
    booking_source: Optional[str] = "WhatsApp AI"
    notes: Optional[str] = None
class PublicAppointmentCreate(BaseModel):
    hospital_id: int
    patient_name: str
    gender: str
    date_of_birth: str
    phone: str
    doctor_id: int
    appointment_date: str


# Token Schema

class TokenCreate(BaseModel):
    appointment_id: int
    token_status: str = "Waiting"
    # User Schema

class UserCreate(BaseModel):
    hospital_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    password: str
    role: str
    status: Optional[str] = "Active"
class LoginRequest(BaseModel):

    email: str
    password: str
    # ==========================
# Receptionist Schema
# ==========================

class ReceptionistCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    password: str
    status: Optional[str] = "Active"
