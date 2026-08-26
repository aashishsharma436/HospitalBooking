from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from auth import SECRET_KEY, ALGORITHM
from database import get_db_connection


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    print("TOKEN RECEIVED:", token)

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("PAYLOAD:", payload)

        user_id = payload.get("user_id")

        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token: user_id missing"
            )

    except JWTError as e:

        print("JWT ERROR:", e)

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


    # =====================================================
    # DATABASE
    # =====================================================

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                users.*,
                doctors.doctor_id

            FROM users

            LEFT JOIN doctors
            ON doctors.user_id = users.user_id
            AND doctors.hospital_id = users.hospital_id

            WHERE users.user_id = %s

            LIMIT 1
            """,
            (user_id,)
        )

        user = cursor.fetchone()

    finally:

        cursor.close()
        connection.close()


    # =====================================================
    # USER NOT FOUND
    # =====================================================

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # =====================================================
    # ACTIVE USER CHECK
    # =====================================================

    if user["status"] != "Active":

        raise HTTPException(
            status_code=403,
            detail="User inactive"
        )


    # =====================================================
    # DOCTOR VALIDATION
    # =====================================================

    if user["role"] == "Doctor":

        if user["doctor_id"] is None:

            raise HTTPException(
                status_code=403,
                detail="Doctor profile not found"
            )


    return user


# =========================================================
# ROLE CHECK
# =========================================================

def require_role(
    allowed_roles: list
):

    def role_checker(
        current_user=Depends(
            get_current_user
        )
    ):

        if current_user["role"] not in allowed_roles:

            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        return current_user

    return role_checker
