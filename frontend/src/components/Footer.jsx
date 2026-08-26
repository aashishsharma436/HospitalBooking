import "../css/footer.css";

function Footer(){

  return(

    <footer className="footer">

      <div className="footer-container">

        <div className="footer-box">

          <h2>City Care Hospital</h2>

          <p>
            Providing trusted healthcare with modern technology
            and compassionate patient care.
          </p>

        </div>


        <div className="footer-box">

          <h3>Quick Links</h3>

          <p>Home</p>
          <p>Doctors</p>
          <p>Book Appointment</p>

        </div>


        <div className="footer-box">

          <h3>Contact</h3>

          <p>📍 Main Road, City</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ info@citycare.com</p>

        </div>


        <div className="footer-box">

          <h3>Timing</h3>

          <p>Monday - Saturday</p>
          <p>9:00 AM - 8:00 PM</p>
          <p>Emergency: 24/7</p>

        </div>


      </div>


      <div className="footer-bottom">

        © 2026 City Care Hospital. All Rights Reserved.

      </div>


    </footer>

  )

}

export default Footer;