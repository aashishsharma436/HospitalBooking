import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../css/adddoctor.css";

function AddDoctor() {

    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);

    const [doctor, setDoctor] = useState({
        department_id: "",
        full_name: "",
        qualification: "",
        phone: "",
        email: "",
        consultation_fee: "",
        status: "Active"
    });

    useEffect(() => {

        const fetchDepartments = async () => {

            try {

                const response = await api.get("/departments/");

                setDepartments(response.data.departments);

            } catch (error) {

                console.log(error);
                alert("Departments load nahi ho paaye");

            }

        };

        fetchDepartments();

    }, []);

    const handleChange = (e) => {

        setDoctor({
            ...doctor,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await api.post("/doctors/", {
                ...doctor,
                department_id: Number(doctor.department_id),
                consultation_fee: Number(doctor.consultation_fee)
            });

            alert("Doctor added successfully");

            navigate("/doctor-management");

        } catch (error) {

            console.log(error);
            alert("Doctor add failed");

        }

    };

    return (

        <div className="add-doctor-page">

            <div className="add-doctor-card">

                <h1>Add Doctor</h1>

                <form onSubmit={handleSubmit}>

                    <select
                        name="department_id"
                        value={doctor.department_id}
                        onChange={handleChange}
                        required
                    >

                        <option value="">
                            Select Department
                        </option>

                        {departments.map((department) => (

                            <option
                                key={department.department_id}
                                value={department.department_id}
                            >
                                {department.department_name}
                            </option>

                        ))}

                    </select>

                    <input
                        name="full_name"
                        placeholder="Doctor Name"
                        value={doctor.full_name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="qualification"
                        placeholder="Qualification"
                        value={doctor.qualification}
                        onChange={handleChange}
                    />

                    <input
                        name="phone"
                        placeholder="Phone"
                        value={doctor.phone}
                        onChange={handleChange}
                    />

                    <input
                        name="email"
                        placeholder="Email"
                        value={doctor.email}
                        onChange={handleChange}
                    />

                    <input
                        name="consultation_fee"
                        placeholder="Consultation Fee"
                        type="number"
                        value={doctor.consultation_fee}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        Save Doctor
                    </button>

                </form>

            </div>

        </div>

    );

}

export default AddDoctor;