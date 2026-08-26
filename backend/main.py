from routers import hospital_dashboard

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from auth import verify_password, create_access_token
from database import get_db_connection

from routers import departments
from routers import patients
from routers import doctors
from routers import appointments
from routers import tokens
from routers import users
from routers import receptionists


app = FastAPI(
    title="Hospital SaaS Backend"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    hospital_dashboard.router
)

app.include_router(
    patients.router
)

app.include_router(
    doctors.router
)

app.include_router(
    departments.router
)

app.include_router(
    appointments.router
)

app.include_router(
    tokens.router
)

app.include_router(
    users.router
)

app.include_router(
    receptionists.router
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Hospital SaaS Backend Running"
    }


# =========================================================
# TEST DATABASE
# =========================================================

@app.get("/test-db")
def test_db():

    connection = get_db_connection()

    cursor = connection.cursor()

    cursor.execute(
        "SHOW TABLES"
    )

    tables = cursor.fetchall()

    cursor.close()

    connection.close()

    return {
        "database": "Connected",
        "tables": tables
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    connection = get_db_connection()

    cursor = connection.cursor(
        dictionary=True
    )


    # =====================================================
    # GET USER + DOCTOR INFORMATION
    # =====================================================

    cursor.execute(
        """
        SELECT

            users.user_id,
            users.hospital_id,
            users.full_name,
            users.email,
            users.phone,
            users.password_hash,
            users.role,
            users.status,

            doctors.doctor_id

        FROM users

        LEFT JOIN doctors
        ON doctors.user_id = users.user_id

        WHERE users.email = %s

        LIMIT 1
        """,
        (
            form_data.username,
        )
    )


    user = cursor.fetchone()


    cursor.close()

    connection.close()


    # =====================================================
    # USER NOT FOUND
    # =====================================================

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # =====================================================
    # PASSWORD VERIFY
    # =====================================================

    if not verify_password(
        form_data.password,
        user["password_hash"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # =====================================================
    # USER STATUS
    # =====================================================

    if user["status"] != "Active":

        raise HTTPException(
            status_code=403,
            detail="User inactive"
        )


    # =====================================================
    # CREATE JWT
    # =====================================================

    token = create_access_token(

        data={

            "sub":
                user["email"],

            "user_id":
                user["user_id"],

            "role":
                user["role"],

            "hospital_id":
                user["hospital_id"],

            "doctor_id":
                user["doctor_id"]

        }

    )


    # =====================================================
    # COMPLETE LOGIN RESPONSE
    # =====================================================

    return {

        "access_token":
            token,

        "token_type":
            "bearer",

        "user_id":
            user["user_id"],

        "hospital_id":
            user["hospital_id"],

        "doctor_id":
            user["doctor_id"],

        "role":
            user["role"],

        "name":
            user["full_name"]

    }
