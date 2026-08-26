import "../css/features.css";

function Features() {

  const features = [
    {
      icon: "🎟️",
      title: "Smart Token System",
      text: "Patients get digital tokens and hospitals can manage waiting queues easily."
    },
    {
      icon: "📅",
      title: "Online Appointment",
      text: "Patients can book appointments anytime without waiting at reception."
    },
    {
      icon: "📲",
      title: "WhatsApp Updates",
      text: "Automatic appointment confirmations and reminders through WhatsApp."
    },
    {
      icon: "👨‍⚕️",
      title: "Doctor Management",
      text: "Manage doctors, timings and availability from one place."
    }
  ];


  return (
    <section className="features">

      <h2>
        Everything Your Hospital Needs
      </h2>

      <p className="features-sub">
        One smart platform to automate hospital operations.
      </p>


      <div className="feature-container">

        {
          features.map((item,index)=>(
            <div className="feature-card" key={index}>

              <div className="feature-icon">
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
  );
}

export default Features;