import "./App.css";

function App() {
  const email = "sharmaanshul7773@gmail.com";

  const handleDemo = () => {
    const subject = encodeURIComponent(
      "SARITEC Healthcare - Book a Demo"
    );

    const body = encodeURIComponent(
      `Hello SARITEC Healthcare,

I would like to book a demo of the SARITEC Healthcare platform.

Name:
Hospital/Clinic:
Phone:

Thank you.`
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  const handleTalk = () => {
    const subject = encodeURIComponent(
      "Enquiry for SARITEC Healthcare"
    );

    const body = encodeURIComponent(
      `Hello Anshul,

I would like to know more about SARITEC Healthcare and its solutions.

Name:
Hospital/Clinic:
Phone:

Thank you.`
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  const handleGetStarted = () => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleExplore = () => {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo">
          SARITEC <span>Healthcare</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Solutions</a>
          <a href="#about">About</a>
          <a href="#founder">Founder</a>
          <a href="#contact">Contact</a>
        </div>

        <button
          className="nav-button"
          onClick={handleGetStarted}
        >
          Get Started
        </button>

      </nav>


      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="badge">
            SMART HEALTHCARE TECHNOLOGY
          </div>

          <h1>
            Better Healthcare.
            <br />
            <span>Better Patient Experience.</span>
          </h1>

          <div className="hero-tagline">
            We Make Patient Experience Better
          </div>

          <p>
            SARITEC Healthcare is building smart digital solutions
            that help hospitals, clinics and diagnostic centres
            simplify operations and deliver a better patient experience.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={handleDemo}
            >
              Book a Demo
            </button>

            <button
              className="secondary-btn"
              onClick={handleExplore}
            >
              Explore Solutions →
            </button>

          </div>

        </div>


        {/* FOUNDER HERO */}
        <div className="founder-hero">

          <div className="founder-photo-placeholder">

            <img
              src="/founder.jpg"
              alt="Founder & CEO"
            />

          </div>

          <div className="founder-info">

            <div className="badge">
              FOUNDER & CEO
            </div>

            <h2>
              Anshul Kumar Sharma
            </h2>

            <h3>
              Founder & CEO, SARITEC Healthcare
            </h3>

            <p>
              Anshul Kumar Sharma is the Founder & CEO of SARITEC
              Healthcare, driven by a vision to make healthcare
              management simpler, smarter and more patient-friendly.
            </p>

            <p>
              Through SARITEC Healthcare, he is focused on creating
              practical technology solutions that improve hospital
              operations and make the patient journey smoother.
            </p>

          </div>

        </div>

      </section>


      {/* PRODUCT DASHBOARD */}
      <section className="dashboard-section">

        <div className="dashboard-intro">

          <div className="badge">
            SARITEC PLATFORM
          </div>

          <h2>
            One smart platform for
            <span> modern healthcare.</span>
          </h2>

          <p>
            Designed to help healthcare teams manage appointments,
            patient flow and everyday hospital operations with ease.
          </p>

        </div>


        <div className="product-card">

          <div className="product-header">

            <div>

              <small>
                SARITEC Healthcare
              </small>

              <h3>
                Smart Hospital Dashboard
              </h3>

            </div>

            <div className="status-dot">
              ●
            </div>

          </div>


          <div className="dashboard-stats">

            <div className="stat-box">
              <span>Appointments</span>
              <strong>128</strong>
            </div>

            <div className="stat-box">
              <span>Patients Today</span>
              <strong>96</strong>
            </div>

            <div className="stat-box">
              <span>Departments</span>
              <strong>08</strong>
            </div>

          </div>


          <div className="dashboard-main">

            <span>
              Patient Experience
            </span>

            <strong>
              Smarter. Simpler. Faster.
            </strong>

          </div>


          <div className="dashboard-line">
            <span>Queue Management</span>
            <span>✓ Active</span>
          </div>

          <div className="dashboard-line">
            <span>Online Appointments</span>
            <span>✓ Active</span>
          </div>

          <div className="dashboard-line">
            <span>Hospital Management</span>
            <span>✓ Connected</span>
          </div>

        </div>

      </section>


      {/* SOLUTIONS */}
      <section className="features" id="features">

        <div className="section-heading">

          <div className="badge">
            OUR SOLUTIONS
          </div>

          <h2>
            Healthcare, made simpler.
          </h2>

          <p>
            Technology designed to make hospital operations easier
            and patient experiences better.
          </p>

        </div>


        <div className="feature-grid">

          <div className="feature-card">

            <div className="icon">
              01
            </div>

            <h3>
              Smart Patient Queue
            </h3>

            <p>
              Manage patient tokens and doctor queues with a simple
              digital system designed to reduce unnecessary waiting.
            </p>

          </div>


          <div className="feature-card">

            <div className="icon">
              02
            </div>

            <h3>
              Easy Appointments
            </h3>

            <p>
              Make appointment booking simple and convenient for
              patients while keeping hospital teams organised.
            </p>

          </div>


          <div className="feature-card">

            <div className="icon">
              03
            </div>

            <h3>
              Hospital Dashboard
            </h3>

            <p>
              Give hospital teams one central platform to manage
              their everyday operations efficiently.
            </p>

          </div>

        </div>

      </section>


      {/* ABOUT */}
      <section className="about-section" id="about">

        <div className="about-content">

          <div className="badge">
            ABOUT SARITEC
          </div>

          <h2>
            Technology that puts
            <span> patients first.</span>
          </h2>

          <p>
            SARITEC Healthcare is building simple and practical
            digital solutions for modern healthcare providers.
          </p>

          <p>
            Our goal is to help hospitals and healthcare centres
            reduce operational complexity, improve patient flow and
            deliver a better experience from appointment to consultation.
          </p>

        </div>


        <div className="about-highlight">

          <strong>
            We Make Patient
            <br />
            Experience Better.
          </strong>

          <span>
            SARITEC Healthcare
          </span>

        </div>

      </section>


      {/* FOUNDER */}
      <section className="founder-section" id="founder">

        <div className="founder-section-photo">

          <img
            src="/founder.jpg"
            alt="Anshul Kumar Sharma - Founder & CEO"
          />

        </div>


        <div className="founder-content">

          <div className="badge">
            FOUNDER & CEO
          </div>

          <h2>
            Anshul Kumar Sharma
          </h2>

          <h3>
            Founder & CEO, SARITEC Healthcare
          </h3>

          <p>
            Anshul Kumar Sharma is the Founder & CEO of SARITEC
            Healthcare, focused on building technology-driven
            solutions that make healthcare management simpler,
            smarter and more patient-friendly.
          </p>

          <p>
            With a vision to improve the everyday healthcare
            experience, SARITEC Healthcare is developing practical
            digital tools that help hospitals streamline operations
            while keeping the patient experience at the centre.
          </p>

        </div>

      </section>


      {/* CTA / CONTACT */}
      <section className="cta-section" id="contact">

        <div>

          <div className="badge">
            GET STARTED
          </div>

          <h2>
            Ready to make healthcare smarter?
          </h2>

          <p>
            Let's build a better patient experience together.
          </p>

          <p>
            Email us at{" "}
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
              target="_blank"
              rel="noreferrer"
            >
              {email}
            </a>
          </p>

        </div>

        <button
          className="primary-btn"
          onClick={handleTalk}
        >
          Talk to SARITEC
        </button>

      </section>


      {/* FOOTER */}
      <footer className="footer">

        <div>

          <div className="footer-logo">
            SARITEC <span>Healthcare</span>
          </div>

          <p>
            Smart Management System
          </p>

          <p>
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
              target="_blank"
              rel="noreferrer"
            >
              {email}
            </a>
          </p>

        </div>

        <div className="footer-right">
          ©️ 2026 SARITEC Healthcare. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default App;