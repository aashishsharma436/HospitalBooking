import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../css/doctormanagement.css";

function DoctorManagement() {

    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        department_id: "",
        full_name: "",
        qualification: "",
        phone: "",
        email: "",
        password: "",
        consultation_fee: "",
        status: "Active",
    });


    const fetchDoctors = async () => {

        try {

            setLoading(true);
            setMessage("");

            const response = await api.get(
                "/doctors/"
            );

            console.log(
                "DOCTORS RESPONSE:",
                response.data
            );

            setDoctors(
                response.data.doctors || []
            );

        } catch (error) {

            console.error(
                "FETCH DOCTORS ERROR:",
                error
            );

            setMessage(
                error.response?.data?.detail ||
                "Doctors load nahi ho paaye."
            );

        } finally {

            setLoading(false);

        }
    };


    const fetchDepartments = async () => {

        try {

            const response = await api.get(
                "/departments/"
            );

            console.log(
                "DEPARTMENTS RESPONSE:",
                response.data
            );

            setDepartments(
                response.data.departments || []
            );

        } catch (error) {

            console.error(
                "FETCH DEPARTMENTS ERROR:",
                error
            );

            setMessage(
                error.response?.data?.detail ||
                "Departments load nahi ho paaye."
            );

        }

    };


    useEffect(() => {

        fetchDoctors();
        fetchDepartments();

    }, []);


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };


    const handleAddDoctor = async (e) => {

        e.preventDefault();

        setMessage("");


        if (!formData.department_id) {

            setMessage(
                "Department select karo."
            );

            return;
        }


        if (!formData.full_name.trim()) {

            setMessage(
                "Doctor name required hai."
            );

            return;
        }


        if (!formData.email.trim()) {

            setMessage(
                "Doctor email required hai."
            );

            return;
        }


        if (!formData.password.trim()) {

            setMessage(
                "Doctor password required hai."
            );

            return;
        }


        try {

            const response = await api.post(
                "/doctors/",
                {

                    department_id:
                        Number(
                            formData.department_id
                        ),

                    full_name:
                        formData.full_name.trim(),

                    qualification:
                        formData.qualification.trim() ||
                        null,

                    phone:
                        formData.phone.trim() ||
                        null,

                    email:
                        formData.email.trim(),

                    password:
                        formData.password,

                    consultation_fee:
                        formData.consultation_fee
                            ? Number(
                                formData.consultation_fee
                            )
                            : null,

                    status:
                        formData.status,

                }
            );


            console.log(
                "ADD DOCTOR RESPONSE:",
                response.data
            );


            setMessage(
                "Doctor successfully add ho gaya."
            );


            setFormData({

                department_id: "",
                full_name: "",
                qualification: "",
                phone: "",
                email: "",
                password: "",
                consultation_fee: "",
                status: "Active",

            });


            fetchDoctors();

        } catch (error) {

            console.error(
                "ADD DOCTOR ERROR:",
                error
            );

            setMessage(
                error.response?.data?.detail ||
                "Doctor add nahi ho paaya."
            );

        }

    };


    const handleDeactivate = async (
        doctorId
    ) => {

        const confirmDelete =
            window.confirm(
                "Kya aap is doctor ko deactivate karna chahte hain?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            const response = await api.delete(
                `/doctors/${doctorId}`
            );


            console.log(
                "DEACTIVATE RESPONSE:",
                response.data
            );


            setMessage(
                "Doctor successfully deactivate ho gaya."
            );


            fetchDoctors();

        } catch (error) {

            console.error(
                "DEACTIVATE ERROR:",
                error
            );

            setMessage(
                error.response?.data?.detail ||
                "Doctor deactivate nahi ho paaya."
            );

        }

    };


    return (

        <div className="doctor-management-page">


            {/* HEADER */}

            <div className="doctor-management-header">

                <div>

                    <Link
                        to="/hospital-dashboard"
                        className="back-dashboard"
                    >
                        ← Back to Dashboard
                    </Link>


                    <div className="doctor-brand">
                        SARITEC Healthcare
                    </div>


                    <h1>
                        Doctor Management
                    </h1>


                    <p>
                        Hospital ke doctors ko
                        manage karein.
                    </p>

                </div>


                <button
                    className="refresh-doctors-btn"
                    onClick={fetchDoctors}
                >
                    ↻ Refresh
                </button>

            </div>



            {/* ADD DOCTOR */}

            <div className="doctor-management-card">


                <div className="card-heading">

                    <div className="card-heading-icon">
                        +
                    </div>


                    <div>

                        <h2>
                            Add New Doctor
                        </h2>


                        <p>
                            Doctor ki basic information
                            enter karein.
                        </p>

                    </div>

                </div>



                <form
                    className="doctor-form"
                    onSubmit={handleAddDoctor}
                >


                    <div className="form-group">

                        <label>
                            Doctor Name
                        </label>


                        <input
                            type="text"
                            name="full_name"
                            placeholder="e.g. Dr. Rahul Sharma"
                            value={
                                formData.full_name
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>



                    <div className="form-group">

                        <label>
                            Department
                        </label>


                        <select
                            name="department_id"
                            value={
                                formData.department_id
                            }
                            onChange={
                                handleChange
                            }
                        >

                            <option value="">
                                Select Department
                            </option>


                            {departments.map(
                                (department) => (

                                    <option
                                        key={
                                            department.department_id
                                        }
                                        value={
                                            department.department_id
                                        }
                                    >

                                        {
                                            department.department_name
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>



                    <div className="form-group">

                        <label>
                            Qualification
                        </label>


                        <input
                            type="text"
                            name="qualification"
                            placeholder="e.g. MBBS, MD"
                            value={
                                formData.qualification
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>



                    <div className="form-group">

                        <label>
                            Phone
                        </label>


                        <input
                            type="text"
                            name="phone"
                            placeholder="Enter phone number"
                            value={
                                formData.phone
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>



                    <div className="form-group">

                        <label>
                            Email
                        </label>


                        <input
                            type="email"
                            name="email"
                            placeholder="doctor@hospital.com"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>



                    {/* PASSWORD */}

                    <div className="form-group">

                        <label>
                            Login Password
                        </label>


                        <input
                            type="password"
                            name="password"
                            placeholder="Enter doctor login password"
                            value={
                                formData.password
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>



                    <div className="form-group">

                        <label>
                            Consultation Fee
                        </label>


                        <div className="fee-input">

                            <span>
                                ₹
                            </span>


                            <input
                                type="number"
                                name="consultation_fee"
                                placeholder="500"
                                value={
                                    formData.consultation_fee
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                    </div>



                    <div className="form-group">

                        <label>
                            Status
                        </label>


                        <select
                            name="status"
                            value={
                                formData.status
                            }
                            onChange={
                                handleChange
                            }
                        >

                            <option value="Active">
                                Active
                            </option>


                            <option value="Inactive">
                                Inactive
                            </option>

                        </select>

                    </div>



                    <div className="form-submit">

                        <button
                            type="submit"
                            className="add-doctor-btn"
                        >
                            + Add Doctor
                        </button>

                    </div>

                </form>



                {message && (

                    <div className="doctor-message">
                        {message}
                    </div>

                )}

            </div>



            {/* DOCTOR LIST */}

            <div className="doctor-management-card">


                <div className="doctor-list-header">

                    <div>

                        <span className="section-label">
                            HOSPITAL STAFF
                        </span>


                        <h2>
                            Registered Doctors
                        </h2>


                        <p>
                            Hospital ke currently
                            registered doctors.
                        </p>

                    </div>


                    <div className="doctor-count">

                        <strong>
                            {doctors.length}
                        </strong>


                        <span>
                            Doctors
                        </span>

                    </div>

                </div>



                {loading ? (

                    <div className="doctor-loading">

                        <div className="doctor-spinner"></div>


                        <p>
                            Loading doctors...
                        </p>

                    </div>

                ) : doctors.length === 0 ? (

                    <div className="empty-doctor-message">

                        <div className="empty-icon">
                            👨‍⚕️
                        </div>


                        <h3>
                            No doctors found
                        </h3>


                        <p>
                            Abhi koi doctor available
                            nahi hai.
                        </p>

                    </div>

                ) : (

                    <div className="doctor-table-wrapper">

                        <table className="doctor-table">


                            <thead>

                                <tr>

                                    <th>
                                        Doctor
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Qualification
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Fee
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

                                {doctors.map(
                                    (doctor) => (

                                        <tr
                                            key={
                                                doctor.doctor_id
                                            }
                                        >


                                            <td>

                                                <div className="doctor-profile">

                                                    <div className="doctor-avatar">

                                                        {
                                                            doctor.full_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()
                                                        }

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                doctor.full_name
                                                            }
                                                        </strong>


                                                        <small>
                                                            ID #
                                                            {
                                                                doctor.doctor_id
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>



                                            <td>

                                                <span className="department-pill">

                                                    {
                                                        doctor.department_name ||
                                                        "-"
                                                    }

                                                </span>

                                            </td>



                                            <td>

                                                {
                                                    doctor.qualification ||
                                                    "-"
                                                }

                                            </td>



                                            <td>

                                                <div className="contact-info">

                                                    <span>
                                                        {
                                                            doctor.phone ||
                                                            "-"
                                                        }
                                                    </span>


                                                    <small>
                                                        {
                                                            doctor.email ||
                                                            "-"
                                                        }
                                                    </small>

                                                </div>

                                            </td>



                                            <td>

                                                {doctor.consultation_fee ? (

                                                    <strong className="fee">

                                                        ₹
                                                        {
                                                            doctor.consultation_fee
                                                        }

                                                    </strong>

                                                ) : (

                                                    "-"

                                                )}

                                            </td>



                                            <td>

                                                <span
                                                    className={
                                                        doctor.status ===
                                                        "Active"
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }
                                                >

                                                    <span className="status-dot"></span>

                                                    {
                                                        doctor.status
                                                    }

                                                </span>

                                            </td>



                                            <td>

                                                {doctor.status ===
                                                    "Active" && (

                                                    <button
                                                        className="deactivate-btn"
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                doctor.doctor_id
                                                            )
                                                        }
                                                    >

                                                        Deactivate

                                                    </button>

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


export default DoctorManagement;