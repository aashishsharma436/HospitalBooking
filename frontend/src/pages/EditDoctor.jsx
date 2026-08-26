import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../css/adddoctor.css";

function EditDoctor() {

    const navigate = useNavigate();

    const { doctor_id } = useParams();

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


    // ==========================
    // Load departments
    // ==========================

    useEffect(() => {

        const loadDepartments = async () => {

            try {

                const response = await api.get(
                    "/departments/"
                );

                setDepartments(
                    response.data.departments
                );

            }

            catch (error) {

                console.log(error);

                alert(
                    "Departments load nahi ho paaye"
                );

            }

        };


        loadDepartments();

    }, []);


    // ==========================
    // Load doctor
    // ==========================

    useEffect(() => {

        const loadDoctor = async () => {

            try {

                const response = await api.get(
                    "/doctors/"
                );

                const doctors =
                    response.data.doctors;

                const selectedDoctor =
                    doctors.find(
                        (item) =>
                            item.doctor_id ===
                            Number(doctor_id)
                    );


                if (!selectedDoctor) {

                    alert(
                        "Doctor nahi mila"
                    );

                    navigate(
                        "/doctor-management"
                    );

                    return;

                }


                setDoctor({

                    department_id:
                        selectedDoctor.department_id,

                    full_name:
                        selectedDoctor.full_name,

                    qualification:
                        selectedDoctor.qualification,

                    phone:
                        selectedDoctor.phone,

                    email:
                        selectedDoctor.email,

                    consultation_fee:
                        selectedDoctor.consultation_fee,

                    status:
                        selectedDoctor.status

                });

            }

            catch (error) {

                console.log(error);

                alert(
                    "Doctor load failed"
                );

            }

        };


        loadDoctor();

    }, [doctor_id, navigate]);


    // ==========================
    // Handle input
    // ==========================

    const handleChange = (e) => {

        setDoctor({

            ...doctor,

            [e.target.name]:
                e.target.value

        });

    };


    // ==========================
    // Update doctor
    // ==========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await api.put(
                `/doctors/${doctor_id}`,
                {

                    ...doctor,

                    department_id:
                        Number(
                            doctor.department_id
                        ),

                    consultation_fee:
                        Number(
                            doctor.consultation_fee
                        )

                }
            );


            alert(
                "Doctor updated successfully"
            );


            navigate(
                "/doctor-management"
            );

        }

        catch (error) {

            console.log(error);

            alert(
                "Doctor update failed"
            );

        }

    };


    return (

        <div className="add-doctor-page">

            <div className="add-doctor-card">

                <h1>
                    Edit Doctor
                </h1>


                <form
                    onSubmit={handleSubmit}
                >


                    <select
                        name="department_id"
                        value={
                            doctor.department_id
                        }
                        onChange={
                            handleChange
                        }
                        required
                    >

                        <option value="">
                            Select Department
                        </option>


                        {
                            departments.map(
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
                            )
                        }

                    </select>


                    <input
                        name="full_name"
                        placeholder="Doctor Name"
                        value={
                            doctor.full_name
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    <input
                        name="qualification"
                        placeholder="Qualification"
                        value={
                            doctor.qualification
                        }
                        onChange={
                            handleChange
                        }
                    />


                    <input
                        name="phone"
                        placeholder="Phone"
                        value={
                            doctor.phone
                        }
                        onChange={
                            handleChange
                        }
                    />


                    <input
                        name="email"
                        placeholder="Email"
                        value={
                            doctor.email
                        }
                        onChange={
                            handleChange
                        }
                    />


                    <input
                        name="consultation_fee"
                        placeholder="Consultation Fee"
                        type="number"
                        value={
                            doctor.consultation_fee
                        }
                        onChange={
                            handleChange
                        }
                    />


                    <select
                        name="status"
                        value={
                            doctor.status
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


                    <button type="submit">

                        Update Doctor

                    </button>


                </form>

            </div>

        </div>

    );

}

export default EditDoctor;