import { Link } from "react-router-dom";
import "../css/navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      <div className="logo">

        <h2>SARITEC Healthcare</h2>

        <p>We Make Patient Experience Better</p>

      </div>

      <nav className="menu">

        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>

        <Link to="/doctors">Doctors</Link>

        <Link to="/booking">Book Appointment</Link>

        <Link to="/login">Hospital Login</Link>

      </nav>

    </header>
  );
}

export default Navbar;