import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../css/receptionistdashboard.css";

function ReceptionistDashboard() {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [callingDoctor, setCallingDoctor] = useState(null);
    const [error, setError] = useState("");


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard = async () => {

        try {

            setError("");

            const [
                appointmentsResponse,
                tokensResponse,
                doctorsResponse
            ] = await Promise.all([
                api.get("/appointments/"),
                api.get("/tokens/"),
                api.get("/doctors/")
            ]);


            setAppointments(
                appointmentsResponse.data.appointments || []
            );


            setTokens(
                tokensResponse.data.tokens || []
            );


            // =================================================
            // ONLY ACTIVE DOCTORS
            // =================================================

            const activeDoctors =
                (doctorsResponse.data.doctors || [])
                    .filter(
                        (doctor) =>
                            doctor.status === "Active"
                    );


            setDoctors(activeDoctors);


        } catch (error) {

            console.error(
                "RECEPTIONIST DASHBOARD ERROR:",
                error
            );


            if (error.response) {

                console.error(
                    "SERVER ERROR:",
                    error.response.data
                );

            }


            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to load dashboard data."
            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // =====================================================
    // TODAY
    // =====================================================

    const today = new Date()
        .toISOString()
        .split("T")[0];


    // =====================================================
    // TODAY'S APPOINTMENTS
    // =====================================================

    const todayAppointments = appointments.filter(
        (appointment) =>
            appointment.appointment_date === today
    );


    // =====================================================
    // TODAY'S TOKENS
    // =====================================================

    const todayTokens = tokens.filter(
        (token) =>
            token.appointment_date === today
    );


    // =====================================================
    // GET DOCTOR APPOINTMENTS
    // =====================================================

    const getDoctorAppointments = (doctorId) => {

        return todayAppointments.filter(
            (appointment) =>
                appointment.doctor_id === doctorId
        );

    };


    // =====================================================
    // GET DOCTOR TOKENS
    // DIRECT DOCTOR ID FILTER
    // =====================================================

    const getDoctorTokens = (doctorId) => {

        return todayTokens.filter(
            (token) =>
                token.doctor_id === doctorId
        );

    };


    // =====================================================
    // CALL NEXT PATIENT
    // =====================================================

    const callNextPatient = async (doctorId) => {

        try {

            setCallingDoctor(doctorId);

            setError("");


            const response = await api.put(
                `/tokens/next-patient/${doctorId}`
            );


            console.log(
                "CALL NEXT RESPONSE:",
                response.data
            );


            // Reload dashboard after calling next patient
            await loadDashboard();


        } catch (error) {

            console.error(
                "CALL NEXT ERROR:",
                error
            );


            if (error.response) {

                console.error(
                    "SERVER ERROR:",
                    error.response.data
                );

            }


            setError(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Unable to call next patient."
            );


        } finally {

            setCallingDoctor(null);

        }

    };


    // =====================================================
    // STATISTICS
    // =====================================================

    const waitingPatients =
        todayTokens.filter(
            (token) =>
                token.token_status === "Waiting"
        ).length;


    // =====================================================
    // RETURN UI
    // =====================================================

    return (

        <div className="receptionist-dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="receptionist-header">

                <div>

                    <h1>
                        Receptionist Dashboard
                    </h1>

                    <p>
                        Manage patients, appointments and doctor queues
                    </p>

                </div>


                <div className="receptionist-welcome">

                    <span>
                        👋
                    </span>

                    Welcome

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="dashboard-error">

                    {error}

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="receptionist-stats">


                <div className="receptionist-stat-card">

                    <div className="stat-icon">
                        👤
                    </div>

                    <div>

                        <span>
                            Today's Patients
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : todayAppointments.length
                            }
                        </h2>

                    </div>

                </div>


                <div className="receptionist-stat-card">

                    <div className="stat-icon">
                        📅
                    </div>

                    <div>

                        <span>
                            Appointments
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : todayAppointments.length
                            }
                        </h2>

                    </div>

                </div>


                <div className="receptionist-stat-card">

                    <div className="stat-icon">
                        🎫
                    </div>

                    <div>

                        <span>
                            Waiting Patients
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : waitingPatients
                            }
                        </h2>

                    </div>

                </div>


                <div className="receptionist-stat-card">

                    <div className="stat-icon">
                        👨‍⚕️
                    </div>

                    <div>

                        <span>
                            Active Doctors
                        </span>

                        <h2>
                            {loading
                                ? "..."
                                : doctors.length
                            }
                        </h2>

                    </div>

                </div>

            </div>


            {/* =================================================
                DOCTOR QUEUES
            ================================================= */}

            <div className="dashboard-section">

                <div className="section-title">

                    <h2>
                        Doctor Queues
                    </h2>

                    <p>
                        Manage each doctor's patient queue separately
                    </p>

                </div>


                {loading ? (

                    <div className="appointment-empty">

                        <div className="empty-icon">
                            ⏳
                        </div>

                        <h3>
                            Loading doctor queues...
                        </h3>

                    </div>

                ) : doctors.length === 0 ? (

                    <div className="appointment-empty">

                        <div className="empty-icon">
                            👨‍⚕️
                        </div>

                        <h3>
                            No active doctors found
                        </h3>

                        <p>
                            Active doctors will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="doctor-queue-grid">


                        {doctors.map((doctor) => {

                            const doctorAppointments =
                                getDoctorAppointments(
                                    doctor.doctor_id
                                );


                            const doctorTokens =
                                getDoctorTokens(
                                    doctor.doctor_id
                                );


                            const currentToken =
                                doctorTokens.find(
                                    (token) =>
                                        token.token_status ===
                                        "Serving"
                                );


                            const waitingTokens =
                                doctorTokens.filter(
                                    (token) =>
                                        token.token_status ===
                                        "Waiting"
                                );


                            const nextToken =
                                waitingTokens.length > 0
                                    ? waitingTokens[0]
                                    : null;


                            const isCalling =
                                callingDoctor ===
                                doctor.doctor_id;


                            return (

                                <div
                                    className="doctor-queue-card"
                                    key={
                                        doctor.doctor_id
                                    }
                                >


                                    {/* DOCTOR HEADER */}

                                    <div className="doctor-queue-header">

                                        <div>

                                            <span>
                                                Doctor
                                            </span>

                                            <h3>
                                                {doctor.full_name}
                                            </h3>

                                        </div>


                                        <div className="doctor-icon">
                                            👨‍⚕️
                                        </div>

                                    </div>


                                    {/* APPOINTMENT COUNT */}

                                    <div
                                        style={{
                                            marginBottom: "15px",
                                            color: "#6b7280",
                                            fontSize: "13px"
                                        }}
                                    >

                                        Today's Appointments:{" "}

                                        <strong>
                                            {
                                                doctorAppointments.length
                                            }
                                        </strong>

                                    </div>


                                    {/* TOKEN DATA */}

                                    <div className="doctor-token-row">

                                        <div>

                                            <span>
                                                Current
                                            </span>

                                            <strong>

                                                {currentToken
                                                    ? currentToken.token_number
                                                    : "—"
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Next
                                            </span>

                                            <strong>

                                                {nextToken
                                                    ? nextToken.token_number
                                                    : "—"
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Waiting
                                            </span>

                                            <strong>
                                                {
                                                    waitingTokens.length
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        CALL NEXT PATIENT
                                    ================================================= */}

                                    <button
                                        type="button"
                                        className="doctor-call-next-button"
                                        onClick={() =>
                                            callNextPatient(
                                                doctor.doctor_id
                                            )
                                        }
                                        disabled={
                                            isCalling ||
                                            waitingTokens.length === 0
                                        }
                                    >

                                        {isCalling

                                            ? "Calling..."

                                            : waitingTokens.length === 0

                                                ? currentToken
                                                    ? `Serving ${currentToken.token_number} • No Next Patient`
                                                    : "No Waiting Patient"

                                                : "🎫 Call Next Patient"

                                        }

                                    </button>


                                </div>

                            );

                        })}


                    </div>

                )}

            </div>


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="dashboard-section">

                <div className="section-title">

                    <h2>
                        Quick Actions
                    </h2>

                    <p>
                        Frequently used receptionist functions
                    </p>

                </div>


                <div className="quick-actions">


                    <button
                        className="quick-action-card"
                        onClick={() =>
                            navigate(
                                "/patient-registration"
                            )
                        }
                    >

                        <span className="quick-action-icon">
                            👤
                        </span>

                        <div>

                            <strong>
                                Register Patient
                            </strong>

                            <small>
                                Add a new patient
                            </small>

                        </div>

                    </button>


                    <button
                        className="quick-action-card"
                        onClick={() =>
                            navigate(
                                "/patients"
                            )
                        }
                    >

                        <span className="quick-action-icon">
                            👥
                        </span>

                        <div>

                            <strong>
                                Patients
                            </strong>

                            <small>
                                View registered patients
                            </small>

                        </div>

                    </button>


                    <button
                        className="quick-action-card"
                        onClick={() =>
                            alert(
                                "Appointment Booking coming next"
                            )
                        }
                    >

                        <span className="quick-action-icon">
                            📅
                        </span>

                        <div>

                            <strong>
                                Book Appointment
                            </strong>

                            <small>
                                Schedule patient appointment
                            </small>

                        </div>

                    </button>


                    <button
                        className="quick-action-card"
                        onClick={() =>
                            document
                                .getElementById(
                                    "today-appointments"
                                )
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >

                        <span className="quick-action-icon">
                            📋
                        </span>

                        <div>

                            <strong>
                                Today's Appointments
                            </strong>

                            <small>
                                View today's schedule
                            </small>

                        </div>

                    </button>


                </div>

            </div>


            {/* =================================================
                TODAY'S APPOINTMENTS
                DOCTOR WISE
            ================================================= */}

            <div
                className="dashboard-section"
                id="today-appointments"
            >

                <div className="section-title">

                    <h2>
                        Today's Appointments
                    </h2>

                    <p>
                        Appointments are grouped separately for each doctor
                    </p>

                </div>


                {loading ? (

                    <div className="appointment-empty">

                        <div className="empty-icon">
                            ⏳
                        </div>

                        <h3>
                            Loading appointments...
                        </h3>

                    </div>

                ) : doctors.length === 0 ? (

                    <div className="appointment-empty">

                        <div className="empty-icon">
                            👨‍⚕️
                        </div>

                        <h3>
                            No active doctors found
                        </h3>

                    </div>

                ) : (

                    <div className="doctor-appointments-list">


                        {doctors.map((doctor) => {

                            const doctorAppointments =
                                getDoctorAppointments(
                                    doctor.doctor_id
                                );


                            const doctorTokens =
                                getDoctorTokens(
                                    doctor.doctor_id
                                );


                            return (

                                <div
                                    className="doctor-appointments-block"
                                    key={
                                        doctor.doctor_id
                                    }
                                >


                                    {/* DOCTOR TITLE */}

                                    <div className="doctor-appointments-header">

                                        <div>

                                            <span>
                                                Doctor
                                            </span>

                                            <h3>
                                                👨‍⚕️{" "}
                                                {doctor.full_name}
                                            </h3>

                                        </div>


                                        <div className="doctor-appointment-count">

                                            {
                                                doctorAppointments.length
                                            }{" "}

                                            {doctorAppointments.length === 1
                                                ? "Appointment"
                                                : "Appointments"
                                            }

                                        </div>

                                    </div>


                                    {/* NO APPOINTMENTS */}

                                    {doctorAppointments.length === 0 ? (

                                        <div className="doctor-no-appointments">

                                            <span>
                                                📅
                                            </span>

                                            No appointments for this doctor today.

                                        </div>

                                    ) : (

                                        <div className="appointments-table-wrapper">

                                            <table className="appointments-table">

                                                <thead>

                                                    <tr>

                                                        <th>
                                                            Patient
                                                        </th>

                                                        <th>
                                                            Time
                                                        </th>

                                                        <th>
                                                            Token
                                                        </th>

                                                        <th>
                                                            Status
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {doctorAppointments.map(
                                                        (appointment) => {

                                                            const token =
                                                                doctorTokens.find(
                                                                    (item) =>
                                                                        item.appointment_id ===
                                                                        appointment.appointment_id
                                                                );


                                                            return (

                                                                <tr
                                                                    key={
                                                                        appointment.appointment_id
                                                                    }
                                                                >

                                                                    <td>

                                                                        <strong>

                                                                            {
                                                                                appointment.patient_name ||
                                                                                "—"
                                                                            }

                                                                        </strong>

                                                                    </td>


                                                                    <td>

                                                                        {
                                                                            appointment.appointment_time ||
                                                                            "—"
                                                                        }

                                                                    </td>


                                                                    <td>

                                                                        <strong>

                                                                            {token
                                                                                ? token.token_number
                                                                                : "—"
                                                                            }

                                                                        </strong>

                                                                    </td>


                                                                    <td>

                                                                        <span
                                                                            className={
                                                                                `token-status ${
                                                                                    token
                                                                                        ? token.token_status.toLowerCase()
                                                                                        : "unknown"
                                                                                }`
                                                                            }
                                                                        >

                                                                            {token
                                                                                ? token.token_status
                                                                                : "No Token"
                                                                            }

                                                                        </span>

                                                                    </td>

                                                                </tr>

                                                            );

                                                        }
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    )}

                                </div>

                            );

                        })}


                    </div>

                )}

            </div>


        </div>

    );

}


export default ReceptionistDashboard;