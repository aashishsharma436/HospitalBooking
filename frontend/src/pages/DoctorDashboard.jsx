import { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../auth/AuthContext";
import "../css/dashboard.css";


function DoctorDashboard() {

    const { user } = useContext(AuthContext);

    const [patients, setPatients] = useState([]);

    const [currentToken, setCurrentToken] = useState(null);

    const [nextToken, setNextToken] = useState(null);

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");


    // =========================================================
    // FETCH TODAY'S PATIENTS
    // =========================================================

    const fetchPatients = async () => {

        try {

            const response = await api.get(
                "/tokens/doctor/patients"
            );

            setPatients(
                response.data.patients || []
            );

        } catch (error) {

            console.error(
                "FETCH DOCTOR PATIENTS ERROR:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Patients load nahi ho paaye."
            );

        }

    };


    // =========================================================
    // FETCH LIVE TOKEN
    // =========================================================

    const fetchLiveToken = async () => {

        try {

            if (
                !user?.hospital_id ||
                !user?.doctor_id
            ) {

                console.log(
                    "Hospital ID / Doctor ID not available"
                );

                return;

            }

            const response = await api.get(
                `/tokens/public/${user.hospital_id}/${user.doctor_id}`
            );

            setCurrentToken(
                response.data.current_token || null
            );

            setNextToken(
                response.data.next_token || null
            );

        } catch (error) {

            console.error(
                "FETCH LIVE TOKEN ERROR:",
                error
            );

        }

    };


    // =========================================================
    // FETCH DASHBOARD DATA
    // =========================================================

    const fetchDashboardData = async () => {

        try {

            await Promise.all([
                fetchPatients(),
                fetchLiveToken()
            ]);

        } catch (error) {

            console.error(
                "FETCH DASHBOARD DATA ERROR:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        if (
            !user?.hospital_id ||
            !user?.doctor_id
        ) {

            return;

        }

        fetchDashboardData();

    }, [
        user?.hospital_id,
        user?.doctor_id
    ]);


    // =========================================================
    // LIVE AUTO REFRESH
    // =========================================================

    useEffect(() => {

        if (
            !user?.hospital_id ||
            !user?.doctor_id
        ) {

            return;

        }

        const interval = setInterval(() => {

            fetchDashboardData();

        }, 3000);

        return () => {

            clearInterval(interval);

        };

    }, [
        user?.hospital_id,
        user?.doctor_id
    ]);


    // =========================================================
    // CALL NEXT PATIENT
    // =========================================================

    const handleCallNextPatient = async () => {

        if (!user?.doctor_id) {

            setError(
                "Doctor ID nahi mila. Please logout karke dobara login karein."
            );

            return;

        }

        try {

            setActionLoading(true);

            setError("");

            setMessage("");

            const response = await api.put(
                `/tokens/next-patient/${user.doctor_id}`
            );

            console.log(
                "CALL NEXT RESPONSE:",
                response.data
            );

            if (!response.data.token) {

                setMessage(
                    "Aaj koi waiting patient nahi hai."
                );

                setCurrentToken(null);

                setNextToken(null);

            } else {

                setCurrentToken(
                    response.data.token
                );

                setMessage(
                    `Patient ${response.data.token.patient_name} ko call kar diya gaya.`
                );

            }

            await fetchDashboardData();

        } catch (error) {

            console.error(
                "CALL NEXT PATIENT ERROR:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Next patient call nahi ho paaya."
            );

        } finally {

            setActionLoading(false);

        }

    };


    // =========================================================
    // COMPLETE CONSULTATION
    // =========================================================

    const handleCompleteConsultation = async () => {

        if (!currentToken?.token_id) {

            setError(
                "Koi current patient nahi hai."
            );

            return;

        }

        try {

            setActionLoading(true);

            setError("");

            setMessage("");

            await api.put(
                `/tokens/${currentToken.token_id}/complete`
            );

            setMessage(
                "Consultation successfully complete ho gayi."
            );

            setCurrentToken(null);

            await fetchDashboardData();

        } catch (error) {

            console.error(
                "COMPLETE CONSULTATION ERROR:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Consultation complete nahi ho paayi."
            );

        } finally {

            setActionLoading(false);

        }

    };


    // =========================================================
    // STATISTICS
    // =========================================================

    const totalPatients =
        patients.length;

    const waitingPatients =
        patients.filter(
            (patient) =>
                patient.token_status === "Waiting"
        ).length;

    const completedPatients =
        patients.filter(
            (patient) =>
                patient.token_status === "Completed"
        ).length;

    const servingPatients =
        patients.filter(
            (patient) =>
                patient.token_status === "Serving"
        ).length;


    // =========================================================
    // RETURN
    // =========================================================

    return (

        <div className="dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <h1>
                    Doctor Dashboard
                </h1>

                <p>
                    Welcome, {user?.name || "Doctor"}
                </p>

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
                SUCCESS MESSAGE
            ================================================= */}

            {message && (

                <div
                    style={{
                        padding: "14px 18px",
                        marginBottom: "25px",
                        borderRadius: "10px",
                        background: "#dcfce7",
                        color: "#166534",
                        fontSize: "14px"
                    }}
                >

                    {message}

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="stats">


                <div className="card">

                    <div className="card-icon">
                        👥
                    </div>

                    <div>

                        <p>
                            Today's Patients
                        </p>

                        <h2>
                            {totalPatients}
                        </h2>

                    </div>

                </div>


                <div className="card">

                    <div className="card-icon">
                        ⏳
                    </div>

                    <div>

                        <p>
                            Waiting
                        </p>

                        <h2>
                            {waitingPatients}
                        </h2>

                    </div>

                </div>


                <div className="card">

                    <div className="card-icon">
                        🩺
                    </div>

                    <div>

                        <p>
                            Serving
                        </p>

                        <h2>
                            {servingPatients}
                        </h2>

                    </div>

                </div>


                <div className="card">

                    <div className="card-icon">
                        ✓
                    </div>

                    <div>

                        <p>
                            Completed
                        </p>

                        <h2>
                            {completedPatients}
                        </h2>

                    </div>

                </div>


            </div>


            {/* =================================================
                LIVE TOKEN
            ================================================= */}

            <div
                className="dashboard-section"
                style={{
                    marginBottom: "35px"
                }}
            >

                <div className="section-header">

                    <h2>
                        Live Token
                    </h2>

                    <p>
                        Live patient queue
                    </p>

                </div>


                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                        marginBottom: "20px"
                    }}
                >


                    {/* CURRENT TOKEN */}

                    <div
                        style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "25px",
                            boxShadow:
                                "0 4px 15px rgba(0,0,0,0.05)",
                            textAlign: "center"
                        }}
                    >

                        <p
                            style={{
                                margin: 0,
                                color: "#6b7280",
                                fontSize: "13px"
                            }}
                        >
                            Current Token
                        </p>

                        <h2
                            style={{
                                margin: "8px 0",
                                fontSize: "42px",
                                color: "#111827"
                            }}
                        >
                            {
                                currentToken?.token_number ||
                                "-"
                            }
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#6b7280"
                            }}
                        >
                            {
                                currentToken?.patient_name ||
                                "No patient serving"
                            }
                        </p>

                    </div>


                    {/* NEXT TOKEN */}

                    <div
                        style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "25px",
                            boxShadow:
                                "0 4px 15px rgba(0,0,0,0.05)",
                            textAlign: "center"
                        }}
                    >

                        <p
                            style={{
                                margin: 0,
                                color: "#6b7280",
                                fontSize: "13px"
                            }}
                        >
                            Next Token
                        </p>

                        <h2
                            style={{
                                margin: "8px 0",
                                fontSize: "42px",
                                color: "#2563eb"
                            }}
                        >
                            {
                                nextToken?.token_number ||
                                "-"
                            }
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#6b7280"
                            }}
                        >
                            {
                                nextToken?.patient_name ||
                                "No waiting patient"
                            }
                        </p>

                    </div>


                    {/* WAITING */}

                    <div
                        style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "25px",
                            boxShadow:
                                "0 4px 15px rgba(0,0,0,0.05)",
                            textAlign: "center"
                        }}
                    >

                        <p
                            style={{
                                margin: 0,
                                color: "#6b7280",
                                fontSize: "13px"
                            }}
                        >
                            Waiting Patients
                        </p>

                        <h2
                            style={{
                                margin: "8px 0",
                                fontSize: "42px",
                                color: "#111827"
                            }}
                        >
                            {waitingPatients}
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#6b7280"
                            }}
                        >
                            Waiting in queue
                        </p>

                    </div>

                </div>


                {/* =================================================
                    CURRENT PATIENT ACTION
                ================================================= */}

                <div
                    style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "25px",
                        boxShadow:
                            "0 4px 15px rgba(0,0,0,0.05)"
                    }}
                >

                    {currentToken ? (

                        <div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center",
                                    gap: "20px",
                                    flexWrap: "wrap"
                                }}
                            >

                                <div>

                                    <p
                                        style={{
                                            margin: 0,
                                            color: "#6b7280",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Current Patient
                                    </p>

                                    <h3
                                        style={{
                                            margin: "5px 0"
                                        }}
                                    >
                                        {
                                            currentToken.patient_name ||
                                            "-"
                                        }
                                    </h3>

                                </div>


                                <div>

                                    <span
                                        style={{
                                            display:
                                                "inline-block",
                                            padding:
                                                "7px 14px",
                                            borderRadius:
                                                "20px",
                                            background:
                                                "#dcfce7",
                                            color:
                                                "#166534",
                                            fontSize:
                                                "13px",
                                            fontWeight:
                                                "600"
                                        }}
                                    >
                                        Serving
                                    </span>

                                </div>


                                <button
                                    onClick={
                                        handleCompleteConsultation
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    style={{
                                        padding:
                                            "12px 20px",
                                        border: "none",
                                        borderRadius:
                                            "10px",
                                        background:
                                            "#16a34a",
                                        color:
                                            "white",
                                        fontWeight:
                                            "600",
                                        cursor:
                                            actionLoading
                                                ? "not-allowed"
                                                : "pointer"
                                    }}
                                >

                                    {
                                        actionLoading
                                            ? "Processing..."
                                            : "Complete Consultation"
                                    }

                                </button>

                            </div>

                        </div>

                    ) : (

                        <div
                            style={{
                                textAlign: "center",
                                padding: "10px"
                            }}
                        >

                            <p
                                style={{
                                    color: "#6b7280",
                                    marginBottom:
                                        "18px"
                                }}
                            >
                                No patient is currently
                                being served.
                            </p>


                            <button
                                onClick={
                                    handleCallNextPatient
                                }
                                disabled={
                                    actionLoading ||
                                    waitingPatients === 0
                                }
                                style={{
                                    padding:
                                        "13px 24px",
                                    border: "none",
                                    borderRadius:
                                        "10px",
                                    background:
                                        waitingPatients === 0
                                            ? "#9ca3af"
                                            : "#2563eb",
                                    color:
                                        "white",
                                    fontWeight:
                                        "600",
                                    cursor:
                                        actionLoading ||
                                        waitingPatients === 0
                                            ? "not-allowed"
                                            : "pointer",
                                    fontSize:
                                        "15px"
                                }}
                            >

                                {
                                    actionLoading
                                        ? "Calling..."
                                        : "📢 Call Next Patient"
                                }

                            </button>

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                TODAY'S PATIENTS
            ================================================= */}

            <div className="dashboard-section">

                <div className="section-header">

                    <h2>
                        Today's Patients
                    </h2>

                    <p>
                        Aaj ke scheduled patients
                    </p>

                </div>


                {loading ? (

                    <div className="dashboard-loading">

                        Loading patients...

                    </div>

                ) : patients.length === 0 ? (

                    <div className="dashboard-loading">

                        Aaj koi patient nahi hai.

                    </div>

                ) : (

                    <div
                        style={{
                            background: "white",
                            borderRadius: "14px",
                            overflowX: "auto",
                            boxShadow:
                                "0 4px 15px rgba(0,0,0,0.05)"
                        }}
                    >

                        <table
                            style={{
                                width: "100%",
                                borderCollapse:
                                    "collapse"
                            }}
                        >

                            <thead>

                                <tr>

                                    <th
                                        style={{
                                            padding: "15px",
                                            textAlign: "left"
                                        }}
                                    >
                                        Token
                                    </th>

                                    <th
                                        style={{
                                            padding: "15px",
                                            textAlign: "left"
                                        }}
                                    >
                                        Patient
                                    </th>

                                    <th
                                        style={{
                                            padding: "15px",
                                            textAlign: "left"
                                        }}
                                    >
                                        Phone
                                    </th>

                                    <th
                                        style={{
                                            padding: "15px",
                                            textAlign: "left"
                                        }}
                                    >
                                        Appointment Time
                                    </th>

                                    <th
                                        style={{
                                            padding: "15px",
                                            textAlign: "left"
                                        }}
                                    >
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {patients.map(
                                    (patient) => (

                                        <tr
                                            key={
                                                patient.token_number
                                            }
                                        >

                                            <td
                                                style={{
                                                    padding: "15px"
                                                }}
                                            >
                                                {
                                                    patient.token_number
                                                }
                                            </td>


                                            <td
                                                style={{
                                                    padding: "15px"
                                                }}
                                            >
                                                {
                                                    patient.patient_name
                                                }
                                            </td>


                                            <td
                                                style={{
                                                    padding: "15px"
                                                }}
                                            >
                                                {
                                                    patient.phone
                                                }
                                            </td>


                                            <td
                                                style={{
                                                    padding: "15px"
                                                }}
                                            >
                                                {
                                                    patient.appointment_time ||
                                                    "-"
                                                }
                                            </td>


                                            <td
                                                style={{
                                                    padding: "15px"
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        fontWeight:
                                                            "600"
                                                    }}
                                                >
                                                    {
                                                        patient.token_status
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


        </div>

    );

}


export default DoctorDashboard;