from fastapi import APIRouter, HTTPException

from schemas import UserCreate, LoginRequest

from auth import (
    verify_password,
    create_access_token,
    get_password_hash
)

import models


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =========================================================
# GET ALL USERS
# =========================================================

@router.get("/")
def get_all_users():

    users = models.get_users()

    return {
        "users": users
    }


# =========================================================
# CREATE USER
# =========================================================

@router.post("/")
def add_user(
    user: UserCreate
):

    user_id = models.create_user(
        user.hospital_id,
        user.full_name,
        user.email,
        user.phone,
        get_password_hash(user.password),
        user.role,
        user.status
    )

    return {
        "message": "User created successfully",
        "user_id": user_id
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(
    user: LoginRequest
):

    # =====================================================
    # GET USER
    # =====================================================

    db_user = models.get_user_by_email(
        user.email
    )


    # =====================================================
    # USER NOT FOUND
    # =====================================================

    if not db_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # =====================================================
    # VERIFY PASSWORD
    # =====================================================

    if not verify_password(
        user.password,
        db_user["password_hash"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # =====================================================
    # CREATE JWT TOKEN
    # =====================================================

    token = create_access_token({

        "user_id": db_user["user_id"],

        "role": db_user["role"],

        "hospital_id": db_user["hospital_id"],

        "doctor_id": db_user.get("doctor_id")

    })


    # =====================================================
    # LOGIN RESPONSE
    # =====================================================

    return {

        "access_token": token,

        "role": db_user["role"],

        "name": db_user["full_name"],

        "user_id": db_user["user_id"],

        "hospital_id": db_user["hospital_id"],

        "doctor_id": db_user.get("doctor_id")

    }
