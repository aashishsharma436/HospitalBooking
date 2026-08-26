import "../css/doctors.css";

function Doctors(){

  const doctors = [
    {
      name:"Dr. Rahul Sharma",
      speciality:"Cardiologist",
      icon:"👨‍⚕️"
    },
    {
      name:"Dr. Priya Verma",
      speciality:"Gynecologist",
      icon:"👩‍⚕️"
    },
    {
      name:"Dr. Amit Singh",
      speciality:"Orthopedic",
      icon:"👨‍⚕️"
    }
  ];


  return(
    <section className="doctors">

      <h2>Our Expert Doctors</h2>

      <p className="doctor-sub">
        Experienced doctors providing trusted healthcare.
      </p>


      <div className="doctor-container">

        {
          doctors.map((doctor,index)=>(
            
            <div className="doctor-card" key={index}>

              <div className="doctor-image">
                {doctor.icon}
              </div>

              <h3>{doctor.name}</h3>

              <p>{doctor.speciality}</p>

              <button>
                Book Appointment
              </button>

            </div>

          ))
        }

      </div>


    </section>
  )

}

export default Doctors;