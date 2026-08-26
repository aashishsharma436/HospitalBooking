import "../css/hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-left">

        <span className="badge">
          Trusted Healthcare
        </span>

        <h1>
          City Care Hospital
        </h1>

        <h3>
          Compassion • Care • Trust
        </h3>

        <p>
          Providing quality healthcare with experienced doctors,
          advanced medical facilities and compassionate patient care.
        </p>

        <button className="whatsapp-btn">
          Book Appointment on WhatsApp
        </button>

      </div>

      <div className="hero-right">

        🏥

      </div>

    </section>
  );
}

export default Hero;