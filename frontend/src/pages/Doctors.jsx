import Navbar from "../components/Navbar"


function Doctors(){

  const doctors = [
    {
      name:"Dr. Rahul Sharma",
      qualification:"MBBS, MD",
      timing:"10 AM - 2 PM",
      fee:"₹500"
    },
    {
      name:"Dr. Amit Kumar",
      qualification:"MBBS, MS",
      timing:"4 PM - 8 PM",
      fee:"₹700"
    }
  ]


  return(

    <div>

      <Navbar />


      <h1>
        Our Doctors
      </h1>


      <div>

        {
          doctors.map((doctor,index)=>(

            <div key={index}>

              <h2>
                {doctor.name}
              </h2>


              <p>
                {doctor.qualification}
              </p>


              <p>
                Timing: {doctor.timing}
              </p>


              <p>
                Consultation: {doctor.fee}
              </p>


              <button>
                Book Appointment
              </button>


            </div>

          ))
        }

      </div>


    </div>

  )

}


export default Doctors