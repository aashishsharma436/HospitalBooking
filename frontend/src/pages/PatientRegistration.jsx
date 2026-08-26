import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../css/patientregistration.css";

function PatientRegistration() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        gender: "",
        date_of_birth: "",
        phone: "",
        email: "",
        address: "",
        emergency_contact: "",
        blood_group: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // Handle Input
    // =========================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // =========================
    // Submit Patient
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!formData.full_name) {

            setError("Patient name is required.");
            return;

        }

        if (!formData.gender) {

            setError("Please select gender.");
            return;

        }

        if (!formData.phone) {

            setError("Phone number is required.");
            return;

        }


        try {

            setLoading(true);


            const response = await api.post(
                "/patients/",
                {
                    full_name: formData.full_name,
                    gender: formData.gender,
                    date_of_birth:
                        formData.date_of_birth || null,
                    phone: formData.phone,
                    email:
                        formData.email || null,
                    address:
                        formData.address || null,
                    emergency_contact:
                        formData.emergency_contact || null,
                    blood_group:
                        formData.blood_group || null
                }
            );


            console.log(
                "PATIENT CREATED:",
                response.data
            );


            alert(
                "Patient registered successfully!"
            );


            // Reset form

            setFormData({
                full_name: "",
                gender: "",
                date_of_birth: "",
                phone: "",
                email: "",
                address: "",
                emergency_contact: "",
                blood_group: ""
            });


            // Back to receptionist dashboard

            navigate(
                "/receptionist-dashboard"
            );


        } catch (error) {

            console.error(
                "PATIENT REGISTRATION ERROR:",
                error
            );


            setError(
                error.response?.data?.detail ||
                "Failed to register patient."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="patient-registration">

            {/* =========================
                Header
            ========================= */}

            <div className="patient-page-header">

                <div>

                    <h1>
                        Register Patient
                    </h1>

                    <p>
                        Add a new patient to the hospital
                        system.
                    </p>

                </div>


                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate(
                            "/receptionist-dashboard"
                        )
                    }
                >
                    ← Back
                </button>

            </div>


            {/* =========================
                Form Card
            ========================= */}

            <div className="patient-form-card">

                <form
                    onSubmit={handleSubmit}
                >

                    {/* Full Name */}

                    <div className="patient-form-group">

                        <label>
                            Full Name *
                        </label>

                        <input
                            type="text"
                            name="full_name"
                            placeholder="Enter patient's full name"
                            value={formData.full_name}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Gender */}

                    <div className="patient-form-group">

                        <label>
                            Gender *
                        </label>

                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Gender
                            </option>

                            <option value="Male">
                                Male
                            </option>

                            <option value="Female">
                                Female
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>

                    </div>


                    {/* Date of Birth */}

                    <div className="patient-form-group">

                        <label>
                            Date of Birth
                        </label>

                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Phone */}

                    <div className="patient-form-group">

                        <label>
                            Phone Number *
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Email */}

                    <div className="patient-form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Emergency Contact */}

                    <div className="patient-form-group">

                        <label>
                            Emergency Contact
                        </label>

                        <input
                            type="tel"
                            name="emergency_contact"
                            placeholder="Emergency contact number"
                            value={
                                formData.emergency_contact
                            }
                            onChange={handleChange}
                        />

                    </div>


                    {/* Blood Group */}

                    <div className="patient-form-group">

                        <label>
                            Blood Group
                        </label>

                        <select
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Blood Group
                            </option>

                            <option value="A+">
                                A+
                            </option>

                            <option value="A-">
                                A-
                            </option>

                            <option value="B+">
                                B+
                            </option>

                            <option value="B-">
                                B-
                            </option>

                            <option value="AB+">
                                AB+
                            </option>

                            <option value="AB-">
                                AB-
                            </option>

                            <option value="O+">
                                O+
                            </option>

                            <option value="O-">
                                O-
                            </option>

                        </select>

                    </div>


                    {/* Address */}

                    <div className="patient-form-group full-width">

                        <label>
                            Address
                        </label>

                        <textarea
                            name="address"
                            placeholder="Enter patient's address"
                            rows="3"
                            value={formData.address}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="patient-form-error">
                            {error}
                        </div>

                    )}


                    {/* Buttons */}

                    <div className="patient-form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate(
                                    "/receptionist-dashboard"
                                )
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Registering..."
                                : "Register Patient"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default PatientRegistration;