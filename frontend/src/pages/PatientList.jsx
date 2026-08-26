import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../css/patientlist.css";

function PatientList() {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================
    // Fetch Patients
    // =========================

    const fetchPatients = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/patients/");

            console.log(
                "PATIENTS RESPONSE:",
                response.data
            );

            const patientData = Array.isArray(response.data)
                ? response.data
                : response.data.patients || [];

            setPatients(patientData);
            setFilteredPatients(patientData);

        } catch (error) {

            console.error(
                "PATIENT FETCH ERROR:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load patients."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // Load Patients
    // =========================

    useEffect(() => {

        fetchPatients();

    }, []);


    // =========================
    // Search
    // =========================

    useEffect(() => {

        const searchValue =
            search.toLowerCase().trim();

        if (!searchValue) {

            setFilteredPatients(patients);
            return;

        }

        const filtered = patients.filter((patient) => {

            const name =
                patient.full_name?.toLowerCase() || "";

            const phone =
                patient.phone?.toLowerCase() || "";

            const patientId =
                String(patient.patient_id || "");

            return (
                name.includes(searchValue) ||
                phone.includes(searchValue) ||
                patientId.includes(searchValue)
            );

        });

        setFilteredPatients(filtered);

    }, [search, patients]);


    // =========================
    // Format Date
    // =========================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const formattedDate =
            new Date(date);

        if (isNaN(formattedDate.getTime())) {
            return date;
        }

        return formattedDate.toLocaleDateString(
            "en-GB"
        );

    };


    return (

        <div className="patient-list-page">

            {/* =========================
                Header
            ========================= */}

            <div className="patient-list-header">

                <div>

                    <h1>
                        Patients
                    </h1>

                    <p>
                        View and manage hospital patients
                    </p>

                </div>


                <button
                    className="add-patient-btn"
                    onClick={() =>
                        navigate(
                            "/patient-registration"
                        )
                    }
                >
                    + Register Patient
                </button>

            </div>


            {/* =========================
                Search
            ========================= */}

            <div className="patient-list-toolbar">

                <div className="patient-search">

                    <span>
                        🔎
                    </span>

                    <input
                        type="text"
                        placeholder="Search by name, phone or patient ID..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <div className="patient-count">

                    Total Patients:
                    <strong>
                        {" "}
                        {filteredPatients.length}
                    </strong>

                </div>

            </div>


            {/* =========================
                Loading
            ========================= */}

            {loading && (

                <div className="patient-list-message">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading patients...
                    </p>

                </div>

            )}


            {/* =========================
                Error
            ========================= */}

            {!loading && error && (

                <div className="patient-list-error">

                    {error}

                    <button
                        onClick={fetchPatients}
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =========================
                Patient Table
            ========================= */}

            {!loading &&
                !error &&
                filteredPatients.length > 0 && (

                    <div className="patient-table-card">

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Gender
                                        </th>

                                        <th>
                                            DOB
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Blood Group
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredPatients.map(
                                        (patient) => (

                                            <tr
                                                key={
                                                    patient.patient_id
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        patient.patient_id
                                                    }
                                                </td>


                                                <td>

                                                    <div className="patient-name">

                                                        <div className="patient-avatar">

                                                            {
                                                                patient.full_name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()
                                                            }

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    patient.full_name
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    patient.email ||
                                                                    "No email"
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>
                                                    {
                                                        patient.gender ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        formatDate(
                                                            patient.date_of_birth
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        patient.phone ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <span className="blood-group">

                                                        {
                                                            patient.blood_group ||
                                                            "-"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        className="view-patient-btn"
                                                        onClick={() =>
                                                            alert(
                                                                "Patient details coming next"
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )
            }


            {/* =========================
                No Patients
            ========================= */}

            {!loading &&
                !error &&
                filteredPatients.length === 0 && (

                    <div className="patient-empty">

                        <div className="empty-patient-icon">
                            👤
                        </div>

                        <h3>
                            {search
                                ? "No patients found"
                                : "No patients registered"
                            }
                        </h3>

                        <p>

                            {search
                                ? "Try searching with a different name, phone number or patient ID."
                                : "Register your first patient to get started."
                            }

                        </p>


                        {!search && (

                            <button
                                onClick={() =>
                                    navigate(
                                        "/patient-registration"
                                    )
                                }
                            >
                                + Register Patient
                            </button>

                        )}

                    </div>

                )
            }

        </div>

    );

}

export default PatientList;