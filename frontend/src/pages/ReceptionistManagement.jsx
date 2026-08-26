import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/receptionistmanagement.css";

function ReceptionistManagement() {

    const [receptionists, setReceptionists] = useState([]);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // ==========================
    // Get Receptionists
    // ==========================

    const fetchReceptionists = async () => {

        try {

            setLoading(true);

            const response = await api.get("/receptionists/");

            setReceptionists(
                response.data.receptionists
            );

        } catch (error) {

            console.error(
                "Error fetching receptionists:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to load receptionists"
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================
    // Load on Page Open
    // ==========================

    useEffect(() => {

        fetchReceptionists();

    }, []);


    // ==========================
    // Handle Input
    // ==========================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // ==========================
    // Add Receptionist
    // ==========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !formData.full_name ||
            !formData.email ||
            !formData.password
        ) {

            alert(
                "Name, email and password are required"
            );

            return;

        }


        try {

            setSaving(true);

            await api.post(
                "/receptionists/",
                {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone || null,
                    password: formData.password,
                    status: "Active"
                }
            );


            alert(
                "Receptionist created successfully"
            );


            setFormData({
                full_name: "",
                email: "",
                phone: "",
                password: ""
            });


            fetchReceptionists();

        } catch (error) {

            console.error(
                "Error creating receptionist:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to create receptionist"
            );

        } finally {

            setSaving(false);

        }

    };


    // ==========================
    // Deactivate Receptionist
    // ==========================

    const handleDeactivate = async (
        receptionistId
    ) => {

        const confirmDeactivate =
            window.confirm(
                "Are you sure you want to deactivate this receptionist?"
            );

        if (!confirmDeactivate) {
            return;
        }


        try {

            await api.delete(
                `/receptionists/${receptionistId}`
            );


            alert(
                "Receptionist deactivated successfully"
            );


            fetchReceptionists();

        } catch (error) {

            console.error(
                "Error deactivating receptionist:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to deactivate receptionist"
            );

        }

    };


    return (

        <div className="receptionist-management">

            {/* ==========================
                PAGE HEADER
            ========================== */}

            <div className="page-header">

                <div>

                    <h1>
                        Receptionist Management
                    </h1>

                    <p>
                        Manage hospital reception staff
                    </p>

                </div>

            </div>


            {/* ==========================
                ADD RECEPTIONIST
            ========================== */}

            <div className="receptionist-form-card">

                <h2>
                    Add Receptionist
                </h2>


                <form
                    onSubmit={handleSubmit}
                >

                    {/* Full Name */}
                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="full_name"
                            placeholder="Enter full name"
                            value={formData.full_name}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Email */}
                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Phone */}
                    <div className="form-group">

                        <label>
                            Phone
                        </label>

                        <input
                            type="text"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Password */}
                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                    >

                        {saving
                            ? "Creating..."
                            : "Add Receptionist"
                        }

                    </button>

                </form>

            </div>


            {/* ==========================
                RECEPTIONIST LIST
            ========================== */}

            <div className="receptionist-list-card">

                <div className="list-header">

                    <h2>
                        Receptionists
                    </h2>

                    <span>
                        {receptionists.length} Total
                    </span>

                </div>


                {loading ? (

                    <p>
                        Loading receptionists...
                    </p>

                ) : receptionists.length === 0 ? (

                    <p>
                        No receptionists found.
                    </p>

                ) : (

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {receptionists.map(
                                    (receptionist) => (

                                        <tr
                                            key={
                                                receptionist.user_id
                                            }
                                        >

                                            <td>
                                                {
                                                    receptionist.full_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    receptionist.email
                                                }
                                            </td>

                                            <td>
                                                {
                                                    receptionist.phone ||
                                                    "-"
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        receptionist.status ===
                                                        "Active"
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }
                                                >
                                                    {
                                                        receptionist.status
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                {receptionist.status ===
                                                "Active" ? (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                receptionist.user_id
                                                            )
                                                        }
                                                    >
                                                        Deactivate
                                                    </button>

                                                ) : (

                                                    <span>
                                                        Inactive
                                                    </span>

                                                )}

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

export default ReceptionistManagement;