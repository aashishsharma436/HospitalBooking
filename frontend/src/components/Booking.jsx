import Confirmation from "../components/Confirmation";
import "../css/booking.css";
import { useState, useEffect } from "react";
import api from "../api/axios";


function Booking(){

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [doctor, setDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState(null);


  // Date format YYYY-MM-DD to DD-MM-YYYY

  const formatDate = (date) => {

    const parts = date.split("-");

    return `${parts[2]}-${parts[1]}-${parts[0]}`;

  };


  // Get doctors from backend

  useEffect(()=>{

    api.get("/doctors/public/1")

    .then((response)=>{

      setDoctors(response.data.doctors);

    })

    .catch((error)=>{

      console.log(error);

    });

  },[]);


  // Book Appointment

  const bookAppointment = async ()=>{

    const appointmentData = {

      hospital_id: 1,

      patient_name: name,

      gender: gender,

      date_of_birth: dob,

      phone: phone,

      doctor_id: Number(doctor),

      appointment_date: appointmentDate

    };


    try{

      const response = await api.post(

        "/appointments/public",

        appointmentData

      );


      const selectedDoctor = doctors.find(

        (doc)=> doc.doctor_id === Number(doctor)

      );


      setAppointmentDetails({

        patient_name: name,

        doctor_name: selectedDoctor?.full_name,

        appointment_date: formatDate(appointmentDate),

        token_number: response.data.token_number

      });


    }

    catch(error){

      console.log(error);

      alert("Booking Failed");

    }

  };


  return(

    <section className="booking">


      <div className="booking-left">

        <h2>
          Book Your Appointment
        </h2>


        <p>
          Schedule your visit with our experienced doctors.
          Get instant confirmation.
        </p>


        <div className="booking-points">

          <p>✅ Quick Appointment</p>

          <p>✅ Digital Token System</p>

          <p>✅ WhatsApp Confirmation</p>

        </div>

      </div>


      <div className="booking-form">


        <label>
          Patient Name
        </label>


        <input
          type="text"
          placeholder="Enter patient name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />


        <label>
          Date of Birth
        </label>


        <input
          type="date"
          value={dob}
          onChange={(e)=>setDob(e.target.value)}
        />


        <label>
          Gender
        </label>


        <select
          value={gender}
          onChange={(e)=>setGender(e.target.value)}
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

        </select>


        <label>
          Mobile Number
        </label>


        <input
          type="number"
          placeholder="Enter mobile number"
          value={phone}
          onChange={(e)=>setPhone(e.target.value)}
        />


        <label>
          Select Doctor
        </label>


        <select
          value={doctor}
          onChange={(e)=>setDoctor(e.target.value)}
        >

          <option value="">
            Select Doctor
          </option>


          {
            doctors.map((doc)=>(

              <option
                key={doc.doctor_id}
                value={doc.doctor_id}
              >

                {doc.full_name}

              </option>

            ))
          }

        </select>


        <label>
          Appointment Date
        </label>


        <input
          type="date"
          value={appointmentDate}
          onChange={(e)=>setAppointmentDate(e.target.value)}
        />


        <button onClick={bookAppointment}>
          Book Appointment
        </button>


        {
          appointmentDetails &&
          <Confirmation appointment={appointmentDetails}/>
        }


      </div>


    </section>

  )

}


export default Booking;