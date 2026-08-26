import "../css/trust.css";

function Trust(){

  const points = [
    {
      icon:"🚑",
      title:"24/7 Emergency Care",
      text:"Quick medical assistance whenever you need it."
    },
    {
      icon:"👨‍⚕️",
      title:"Experienced Doctors",
      text:"Qualified doctors providing trusted treatment."
    },
    {
      icon:"🏥",
      title:"Modern Facilities",
      text:"Advanced healthcare facilities for better care."
    },
    {
      icon:"❤️",
      title:"Patient First",
      text:"Your health and comfort are our priority."
    }
  ];


  return(

    <section className="trust">

      <h2>
        Why Patients Trust Us
      </h2>

      <p className="trust-sub">
        Quality healthcare with compassion and technology.
      </p>


      <div className="trust-container">

        {
          points.map((item,index)=>(

            <div className="trust-card" key={index}>

              <div className="trust-icon">
                {item.icon}
              </div>

              <h3>
                {item.title}
              </h3>

              <p>
                {item.text}
              </p>

            </div>

          ))
        }

      </div>

    </section>

  )

}

export default Trust;