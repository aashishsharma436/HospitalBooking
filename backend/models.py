from database import get_db_connection


# =========================================================
# PATIENT MANAGEMENT
# =========================================================

def get_patients(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM patients
        WHERE hospital_id = %s
        ORDER BY full_name ASC
        """,
        (hospital_id,)
    )

    patients = cursor.fetchall()

    cursor.close()
    connection.close()

    return patients


def create_patient(
    hospital_id,
    full_name,
    gender,
    date_of_birth,
    phone,
    email,
    address,
    emergency_contact,
    blood_group
):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO patients
    (
        hospital_id,
        full_name,
        gender,
        date_of_birth,
        phone,
        email,
        address,
        emergency_contact,
        blood_group
    )
    VALUES
    (
        %s,%s,%s,%s,%s,%s,%s,%s,%s
    )
    """

    cursor.execute(
        query,
        (
            hospital_id,
            full_name,
            gender,
            date_of_birth,
            phone,
            email,
            address,
            emergency_contact,
            blood_group
        )
    )

    connection.commit()

    patient_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return patient_id


def check_duplicate_booking(
    hospital_id,
    phone,
    appointment_date
):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT appointments.appointment_id

        FROM patients

        INNER JOIN appointments
        ON patients.patient_id = appointments.patient_id

        WHERE patients.hospital_id = %s
        AND patients.phone = %s
        AND appointments.appointment_date = %s
        """,
        (
            hospital_id,
            phone,
            appointment_date
        )
    )

    booking = cursor.fetchone()

    cursor.close()
    connection.close()

    return booking


# =========================================================
# DOCTOR MANAGEMENT
# =========================================================

def get_doctors(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            doctors.doctor_id,
            doctors.hospital_id,
            doctors.department_id,
            departments.department_name,
            doctors.full_name,
            doctors.qualification,
            doctors.phone,
            doctors.email,
            doctors.consultation_fee,
            doctors.status

        FROM doctors

        LEFT JOIN departments
        ON doctors.department_id = departments.department_id

        WHERE doctors.hospital_id = %s

        ORDER BY doctors.full_name ASC
        """,
        (hospital_id,)
    )

    doctors = cursor.fetchall()

    cursor.close()
    connection.close()

    return doctors


def create_doctor(
    hospital_id,
    department_id,
    full_name,
    qualification,
    phone,
    email,
    password,
    consultation_fee,
    status
):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:

        # =====================================================
        # CREATE DOCTOR LOGIN USER
        # =====================================================

        from auth import get_password_hash

        password_hash = get_password_hash(password)

        cursor.execute(
            """
            INSERT INTO users
            (
                hospital_id,
                full_name,
                email,
                phone,
                password_hash,
                role,
                status
            )
            VALUES
            (
                %s,%s,%s,%s,%s,'Doctor',%s
            )
            """,
            (
                hospital_id,
                full_name,
                email,
                phone,
                password_hash,
                status
            )
        )

        user_id = cursor.lastrowid


        # =====================================================
        # CREATE DOCTOR
        # =====================================================

        cursor.execute(
            """
            INSERT INTO doctors
            (
                user_id,
                hospital_id,
                department_id,
                full_name,
                qualification,
                phone,
                email,
                consultation_fee,
                status
            )
            VALUES
            (
                %s,%s,%s,%s,%s,%s,%s,%s,%s
            )
            """,
            (
                user_id,
                hospital_id,
                department_id,
                full_name,
                qualification,
                phone,
                email,
                consultation_fee,
                status
            )
        )

        doctor_id = cursor.lastrowid

        connection.commit()

        return doctor_id

    except Exception:

        connection.rollback()

        raise

    finally:

        cursor.close()
        connection.close()

def update_doctor(
    doctor_id,
    hospital_id,
    department_id,
    full_name,
    qualification,
    phone,
    email,
    consultation_fee,
    status
):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    UPDATE doctors
    SET
        department_id = %s,
        full_name = %s,
        qualification = %s,
        phone = %s,
        email = %s,
        consultation_fee = %s,
        status = %s
    WHERE doctor_id = %s
    AND hospital_id = %s
    """

    cursor.execute(
        query,
        (
            department_id,
            full_name,
            qualification,
            phone,
            email,
            consultation_fee,
            status,
            doctor_id,
            hospital_id
        )
    )

    connection.commit()

    affected_rows = cursor.rowcount

    cursor.close()
    connection.close()

    return affected_rows


def deactivate_doctor(
    doctor_id,
    hospital_id
):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE doctors
        SET status = 'Inactive'
        WHERE doctor_id = %s
        AND hospital_id = %s
        """,
        (
            doctor_id,
            hospital_id
        )
    )

    connection.commit()

    affected_rows = cursor.rowcount

    cursor.close()
    connection.close()

    return affected_rows


# =========================================================
# DEPARTMENT MANAGEMENT
# =========================================================

def get_departments(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            department_id,
            department_name,
            description
        FROM departments
        WHERE hospital_id = %s
        AND status = 'Active'
        ORDER BY department_name ASC
        """,
        (hospital_id,)
    )

    departments = cursor.fetchall()

    cursor.close()
    connection.close()

    return departments


def create_department(
    hospital_id,
    department_name,
    description
):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO departments
    (
        hospital_id,
        department_name,
        description,
        status
    )
    VALUES
    (
        %s,%s,%s,'Active'
    )
    """

    cursor.execute(
        query,
        (
            hospital_id,
            department_name,
            description
        )
    )

    connection.commit()

    department_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return department_id


def update_department(
    department_id,
    hospital_id,
    department_name,
    description
):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    UPDATE departments
    SET
        department_name = %s,
        description = %s
    WHERE department_id = %s
    AND hospital_id = %s
    """

    cursor.execute(
        query,
        (
            department_name,
            description,
            department_id,
            hospital_id
        )
    )

    connection.commit()

    affected_rows = cursor.rowcount

    cursor.close()
    connection.close()

    return affected_rows


def deactivate_department(
    department_id,
    hospital_id
):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE departments
        SET status = 'Inactive'
        WHERE department_id = %s
        AND hospital_id = %s
        """,
        (
            department_id,
            hospital_id
        )
    )

    connection.commit()

    affected_rows = cursor.rowcount

    cursor.close()
    connection.close()

    return affected_rows


# =========================================================
# APPOINTMENT MANAGEMENT
# =========================================================

def get_appointments(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            appointments.*,
            patients.full_name AS patient_name,
            doctors.full_name AS doctor_name

        FROM appointments

        LEFT JOIN patients
        ON appointments.patient_id = patients.patient_id

        LEFT JOIN doctors
        ON appointments.doctor_id = doctors.doctor_id

        WHERE appointments.hospital_id = %s

        ORDER BY appointments.appointment_date DESC,
                 appointments.appointment_time ASC
        """,
        (hospital_id,)
    )

    appointments = cursor.fetchall()

    cursor.close()
    connection.close()

    return appointments


def create_appointment(
    hospital_id,
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    appointment_status,
    booking_source,
    notes
):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO appointments
    (
        hospital_id,
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        appointment_status,
        booking_source,
        notes
    )
    VALUES
    (
        %s,%s,%s,%s,%s,%s,%s,%s
    )
    """

    cursor.execute(
        query,
        (
            hospital_id,
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            appointment_status,
            booking_source,
            notes
        )
    )

    connection.commit()

    appointment_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return appointment_id


def get_appointment_details(appointment_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            appointment_id,
            hospital_id,
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            appointment_status,
            booking_source,
            notes

        FROM appointments

        WHERE appointment_id = %s
        """,
        (appointment_id,)
    )

    appointment = cursor.fetchone()

    cursor.close()
    connection.close()

    return appointment


# =========================================================
# TOKEN MANAGEMENT
# =========================================================

def generate_token_number(
    hospital_id,
    doctor_id,
    appointment_date
):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT COUNT(*) AS total_tokens

        FROM tokens

        INNER JOIN appointments
        ON tokens.appointment_id = appointments.appointment_id

        WHERE tokens.hospital_id = %s
        AND appointments.doctor_id = %s
        AND appointments.appointment_date = %s
        """,
        (
            hospital_id,
            doctor_id,
            appointment_date
        )
    )

    result = cursor.fetchone()

    next_number = result["total_tokens"] + 1

    token_number = f"T{next_number:03d}"

    cursor.close()
    connection.close()

    return token_number


def create_token(
    hospital_id,
    appointment_id,
    doctor_id,
    appointment_date,
    token_number,
    token_status="Waiting"
):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO tokens
    (
        hospital_id,
        appointment_id,
        token_number,
        token_status
    )
    VALUES
    (
        %s,%s,%s,%s
    )
    """

    cursor.execute(
        query,
        (
            hospital_id,
            appointment_id,
            token_number,
            token_status
        )
    )

    connection.commit()

    token_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return token_id


def get_tokens(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            tokens.token_id,
            tokens.hospital_id,
            tokens.appointment_id,
            tokens.token_number,
            tokens.token_status,
            tokens.created_at,
            tokens.served_at,

            appointments.doctor_id,
            appointments.appointment_date,
            appointments.appointment_time,

            patients.full_name AS patient_name,

            doctors.full_name AS doctor_name

        FROM tokens

        LEFT JOIN appointments
        ON tokens.appointment_id = appointments.appointment_id

        LEFT JOIN patients
        ON appointments.patient_id = patients.patient_id

        LEFT JOIN doctors
        ON appointments.doctor_id = doctors.doctor_id

        WHERE tokens.hospital_id = %s
        AND DATE(tokens.created_at) = CURDATE()

        ORDER BY tokens.token_id ASC
        """,
        (hospital_id,)
    )

    tokens = cursor.fetchall()

    cursor.close()
    connection.close()

    return tokens


# =========================================================
# SERVE NEXT TOKEN - DOCTOR WISE
# =========================================================

def serve_next_token(
    hospital_id,
    doctor_id
):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # =====================================================
    # FIND CURRENT SERVING TOKEN FOR THIS DOCTOR
    # =====================================================

    cursor.execute(
        """
        SELECT
            tokens.token_id

        FROM tokens

        INNER JOIN appointments
        ON tokens.appointment_id = appointments.appointment_id

        WHERE tokens.hospital_id = %s
        AND appointments.doctor_id = %s
        AND tokens.token_status = 'Serving'
        AND appointments.appointment_date = CURDATE()

        ORDER BY tokens.token_id ASC

        LIMIT 1
        """,
        (
            hospital_id,
            doctor_id
        )
    )

    current_token = cursor.fetchone()


    # =====================================================
    # COMPLETE CURRENT PATIENT
    # =====================================================

    if current_token:

        cursor.execute(
            """
            UPDATE tokens

            SET
                token_status = 'Completed',
                served_at = CURRENT_TIMESTAMP

            WHERE token_id = %s
            AND hospital_id = %s
            AND token_status = 'Serving'
            """,
            (
                current_token["token_id"],
                hospital_id
            )
        )

        connection.commit()


    # =====================================================
    # GET NEXT WAITING TOKEN FOR THIS DOCTOR
    # =====================================================

    cursor.execute(
        """
        SELECT
            tokens.*,
            patients.full_name AS patient_name,
            doctors.full_name AS doctor_name

        FROM tokens

        INNER JOIN appointments
        ON tokens.appointment_id = appointments.appointment_id

        LEFT JOIN patients
        ON appointments.patient_id = patients.patient_id

        LEFT JOIN doctors
        ON appointments.doctor_id = doctors.doctor_id

        WHERE tokens.hospital_id = %s
        AND appointments.doctor_id = %s
        AND tokens.token_status = 'Waiting'
        AND appointments.appointment_date = CURDATE()

        ORDER BY tokens.token_id ASC

        LIMIT 1
        """,
        (
            hospital_id,
            doctor_id
        )
    )

    token = cursor.fetchone()


    # =====================================================
    # NO NEXT PATIENT
    # =====================================================

    if not token:

        cursor.close()
        connection.close()

        return None


    # =====================================================
    # CHANGE NEXT PATIENT TO SERVING
    # =====================================================

    cursor.execute(
        """
        UPDATE tokens

        SET token_status = 'Serving'

        WHERE token_id = %s
        AND hospital_id = %s
        AND token_status = 'Waiting'
        """,
        (
            token["token_id"],
            hospital_id
        )
    )

    connection.commit()


    # =====================================================
    # UPDATE RESPONSE OBJECT
    # =====================================================

    token["token_status"] = "Serving"


    cursor.close()
    connection.close()

    return token

def complete_token(
    token_id,
    hospital_id
):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE tokens
        SET
            token_status = 'Completed',
            served_at = CURRENT_TIMESTAMP

        WHERE token_id = %s
        AND hospital_id = %s
        """,
        (
            token_id,
            hospital_id
        )
    )

    connection.commit()

    affected_rows = cursor.rowcount

    cursor.close()
    connection.close()

    return affected_rows


def get_patient_token_status(
    token_id,
    hospital_id
):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM tokens

        WHERE token_id = %s
        AND hospital_id = %s
        """,
        (
            token_id,
            hospital_id
        )
    )

    my_token = cursor.fetchone()

    cursor.execute(
        """
        SELECT *
        FROM tokens

        WHERE hospital_id = %s
        AND token_status = 'Serving'

        ORDER BY token_id ASC

        LIMIT 1
        """,
        (hospital_id,)
    )

    current_token = cursor.fetchone()

    cursor.close()
    connection.close()

    return {
        "my_token": my_token,
        "current_token": current_token
    }


def get_live_token(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            token_number,
            token_status

        FROM tokens

        WHERE hospital_id = %s
        AND token_status = 'Serving'

        ORDER BY token_id ASC

        LIMIT 1
        """,
        (hospital_id,)
    )

    token = cursor.fetchone()

    cursor.close()
    connection.close()

    if not token:

        return {
            "current_token": None,
            "message": "No patient is being served"
        }

    return {
        "current_token": token["token_number"],
        "status": token["token_status"],
        "message": "Please enter doctor room"
    }


# =========================================================
# TOKEN DASHBOARD
# =========================================================

def get_token_dashboard(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # =====================================================
    # CURRENT SERVING TOKEN - TODAY ONLY
    # =====================================================

    cursor.execute(
        """
        SELECT *
        FROM tokens

        WHERE hospital_id = %s
        AND token_status = 'Serving'
        AND DATE(created_at) = CURDATE()

        ORDER BY token_id ASC

        LIMIT 1
        """,
        (hospital_id,)
    )

    current_token = cursor.fetchone()

    # =====================================================
    # WAITING COUNT - TODAY ONLY
    # =====================================================

    cursor.execute(
        """
        SELECT COUNT(*) AS waiting_count

        FROM tokens

        WHERE hospital_id = %s
        AND token_status = 'Waiting'
        AND DATE(created_at) = CURDATE()
        """,
        (hospital_id,)
    )

    waiting = cursor.fetchone()

    # =====================================================
    # NEXT TOKEN - TODAY ONLY
    # =====================================================

    cursor.execute(
        """
        SELECT *
        FROM tokens

        WHERE hospital_id = %s
        AND token_status = 'Waiting'
        AND DATE(created_at) = CURDATE()

        ORDER BY token_id ASC

        LIMIT 1
        """,
        (hospital_id,)
    )

    next_token = cursor.fetchone()

    # =====================================================
    # TOTAL PATIENTS / TOKENS - TODAY ONLY
    # =====================================================

    cursor.execute(
        """
        SELECT COUNT(*) AS total_patients

        FROM tokens

        WHERE hospital_id = %s
        AND DATE(created_at) = CURDATE()
        """,
        (hospital_id,)
    )

    total = cursor.fetchone()

    # =====================================================
    # COMPLETED PATIENTS - TODAY ONLY
    # =====================================================

    cursor.execute(
        """
        SELECT COUNT(*) AS completed_patients

        FROM tokens

        WHERE hospital_id = %s
        AND token_status = 'Completed'
        AND DATE(created_at) = CURDATE()
        """,
        (hospital_id,)
    )

    completed = cursor.fetchone()

    cursor.close()
    connection.close()

    return {
        "current_token": current_token,
        "waiting_count": waiting["waiting_count"],
        "next_token": next_token,
        "total_patients": total["total_patients"],
        "completed_patients": completed["completed_patients"]
    }


# =========================================================
# PUBLIC TOKEN DISPLAY - DOCTOR WISE
# =========================================================

def get_public_token_display(
    hospital_id,
    doctor_id
):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)


    # =====================================================
    # CURRENT SERVING PATIENT
    # =====================================================

    cursor.execute(
        """
        SELECT

            tokens.token_id,
            tokens.token_number,
            tokens.token_status,

            patients.full_name AS patient_name,

            doctors.full_name AS doctor_name

        FROM tokens

        INNER JOIN appointments
        ON tokens.appointment_id =
           appointments.appointment_id

        INNER JOIN patients
        ON appointments.patient_id =
           patients.patient_id

        INNER JOIN doctors
        ON appointments.doctor_id =
           doctors.doctor_id

        WHERE tokens.hospital_id = %s

        AND appointments.doctor_id = %s

        AND appointments.appointment_date = CURDATE()

        AND tokens.token_status = 'Serving'

        ORDER BY tokens.token_id ASC

        LIMIT 1
        """,
        (
            hospital_id,
            doctor_id
        )
    )

    current_token = cursor.fetchone()


    # =====================================================
    # NEXT WAITING PATIENT
    # =====================================================

    cursor.execute(
        """
        SELECT

            tokens.token_id,
            tokens.token_number,
            tokens.token_status,

            patients.full_name AS patient_name,

            doctors.full_name AS doctor_name

        FROM tokens

        INNER JOIN appointments
        ON tokens.appointment_id =
           appointments.appointment_id

        INNER JOIN patients
        ON appointments.patient_id =
           patients.patient_id

        INNER JOIN doctors
        ON appointments.doctor_id =
           doctors.doctor_id

        WHERE tokens.hospital_id = %s

        AND appointments.doctor_id = %s

        AND appointments.appointment_date = CURDATE()

        AND tokens.token_status = 'Waiting'

        ORDER BY tokens.token_id ASC

        LIMIT 1
        """,
        (
            hospital_id,
            doctor_id
        )
    )

    next_token = cursor.fetchone()


    # =====================================================
    # DOCTOR INFORMATION
    # =====================================================

    cursor.execute(
        """
        SELECT
            doctor_id,
            full_name,
            qualification,
            department_id

        FROM doctors

        WHERE doctor_id = %s

        AND hospital_id = %s

        LIMIT 1
        """,
        (
            doctor_id,
            hospital_id
        )
    )

    doctor = cursor.fetchone()


    cursor.close()
    connection.close()


    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "hospital_id": hospital_id,

        "doctor": doctor,

        "current_token": current_token,

        "next_token": next_token

    }
# =========================================================
# USER MANAGEMENT
# =========================================================

def get_users():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            user_id,
            hospital_id,
            full_name,
            email,
            phone,
            role,
            status
        FROM users
        """
    )

    users = cursor.fetchall()

    cursor.close()
    connection.close()

    return users


def create_user(
    hospital_id,
    full_name,
    email,
    phone,
    password_hash,
    role,
    status
):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO users
    (
        hospital_id,
        full_name,
        email,
        phone,
        password_hash,
        role,
        status
    )
    VALUES
    (
        %s,%s,%s,%s,%s,%s,%s
    )
    """

    cursor.execute(
        query,
        (
            hospital_id,
            full_name,
            email,
            phone,
            password_hash,
            role,
            status
        )
    )

    connection.commit()

    user_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return user_id


def get_user_by_email(email):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            users.*,
            doctors.doctor_id

        FROM users

        LEFT JOIN doctors
        ON doctors.user_id = users.user_id

        WHERE users.email = %s

        LIMIT 1
        """,
        (email,)
    )

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    return user


# =========================================================
# RECEPTIONIST MANAGEMENT
# =========================================================

def get_receptionists(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            user_id,
            hospital_id,
            full_name,
            email,
            phone,
            role,
            status,
            created_at

        FROM users

        WHERE hospital_id = %s
        AND role = 'Receptionist'

        ORDER BY full_name ASC
        """,
        (hospital_id,)
    )

    receptionists = cursor.fetchall()

    cursor.close()
    connection.close()

    return receptionists


def create_receptionist(
    hospital_id,
    full_name,
    email,
    phone,
    password,
    status
):

    connection = get_db_connection()
    cursor = connection.cursor()

    from auth import get_password_hash

    password_hash = get_password_hash(password)

    query = """
    INSERT INTO users
    (
        hospital_id,
        full_name,
        email,
        phone,
        password_hash,
        role,
        status
    )
    VALUES
    (
        %s,%s,%s,%s,%s,'Receptionist',%s
    )
    """

    cursor.execute(
        query,
        (
            hospital_id,
            full_name,
            email,
            phone,
            password_hash,
            status
        )
    )

    connection.commit()

    receptionist_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return receptionist_id


def deactivate_receptionist(
    receptionist_id,
    hospital_id
):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE users

        SET status = 'Inactive'

        WHERE user_id = %s
        AND hospital_id = %s
        AND role = 'Receptionist'
        """,
        (
            receptionist_id,
            hospital_id
        )
    )

    connection.commit()

    affected_rows = cursor.rowcount

    cursor.close()
    connection.close()

    return affected_rows


# =========================================================
# DOCTOR TODAY PATIENTS
# =========================================================

def get_doctor_today_patients(
    hospital_id,
    doctor_id
):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT

            tokens.token_number,
            tokens.token_status,

            patients.full_name AS patient_name,
            patients.phone,

            appointments.appointment_date,
            appointments.appointment_time

        FROM appointments

        JOIN patients
        ON appointments.patient_id = patients.patient_id

        JOIN tokens
        ON appointments.appointment_id = tokens.appointment_id

        WHERE appointments.hospital_id = %s
        AND appointments.doctor_id = %s
        AND appointments.appointment_date = CURDATE()

        ORDER BY tokens.token_id ASC
        """,
        (
            hospital_id,
            doctor_id
        )
    )

    patients = cursor.fetchall()

    cursor.close()
    connection.close()

    return patients


# =========================================================
# HOSPITAL DASHBOARD
# =========================================================

def get_hospital_dashboard(hospital_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT COUNT(*) AS total_doctors

        FROM doctors

        WHERE hospital_id = %s
        """,
        (hospital_id,)
    )

    doctors = cursor.fetchone()

    cursor.execute(
        """
        SELECT COUNT(*) AS total_patients

        FROM patients

        WHERE hospital_id = %s
        """,
        (hospital_id,)
    )

    patients = cursor.fetchone()

    cursor.execute(
        """
        SELECT COUNT(*) AS total_appointments

        FROM appointments

        WHERE hospital_id = %s
        AND appointment_date = CURDATE()
        """,
        (hospital_id,)
    )

    appointments = cursor.fetchone()

    cursor.execute(
        """
        SELECT COUNT(*) AS waiting_tokens

        FROM tokens

        WHERE hospital_id = %s
        AND token_status = 'Waiting'
        """,
        (hospital_id,)
    )

    tokens = cursor.fetchone()

    cursor.close()
    connection.close()

    return {
        "total_doctors": doctors["total_doctors"],
        "total_patients": patients["total_patients"],
        "today_appointments": appointments["total_appointments"],
        "waiting_tokens": tokens["waiting_tokens"]
    }
