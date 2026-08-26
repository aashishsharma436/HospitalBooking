import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { AuthContext } from "../auth/AuthContext";
import "../css/login.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);


    try {

      const data =
        await loginUser(
          email,
          password
        );


      console.log(
        "LOGIN API RESPONSE:",
        data
      );


      // =====================================================
      // VALIDATE LOGIN RESPONSE
      // =====================================================

      if (
        !data ||
        !data.access_token
      ) {

        setError(
          "Invalid login response."
        );

        setLoading(false);

        return;

      }


      console.log(
        "TOKEN RECEIVED:",
        data.access_token
      );


      // =====================================================
      // SAVE USER + TOKEN
      // =====================================================

      login(data);


      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "TOKEN AFTER LOGIN:",
        sessionStorage.getItem("token")
      );


      console.log(
        "USER AFTER LOGIN:",
        sessionStorage.getItem("user")
      );


      alert(
        "Login Successful"
      );


      // =====================================================
      // ROLE BASED REDIRECT
      // =====================================================

      if (
        data.role === "Receptionist"
      ) {

        navigate(
          "/receptionist-dashboard"
        );

      }

      else if (
        data.role === "Doctor"
      ) {

        navigate(
          "/doctor-dashboard"
        );

      }

      else if (
        data.role === "HospitalAdmin" ||
        data.role === "SuperAdmin"
      ) {

        navigate(
          "/hospital-dashboard"
        );

      }

      else {

        setError(
          "Unknown user role."
        );

      }


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );


      if (error.response) {

        setError(

          error.response.data?.detail ||

          "Invalid email or password."

        );

      }

      else {

        setError(
          "Server se connect nahi ho pa raha."
        );

      }


    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="login-page">


      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="login-left">

        <div className="brand-section">

          <div className="brand-logo">
            S
          </div>

          <h1>
            SARITEC Healthcare
          </h1>

          <p>
            Smart Management System,
            Makes Patients Experience Better
          </p>

        </div>


        <div className="healthcare-content">

          <h2>
            Smarter Hospitals.
            <br />
            Better Healthcare.
          </h2>

          <p>
            Manage doctors, departments,
            patients and appointments
            from one powerful platform.
          </p>


          <div className="feature-list">

            <div className="feature-item">

              <span>
                ✓
              </span>

              Hospital Management

            </div>


            <div className="feature-item">

              <span>
                ✓
              </span>

              Doctor & Department Management

            </div>


            <div className="feature-item">

              <span>
                ✓
              </span>

              Secure Role-Based Access

            </div>

          </div>

        </div>


        <div className="login-footer">

          ©️ 2026 SARITEC Healthcare

        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="login-right">

        <div className="login-card">


          {/* =================================================
              MOBILE BRAND
          ================================================= */}

          <div className="mobile-brand">

            <div className="brand-logo small">
              S
            </div>

            <span>
              SARITEC Healthcare
            </span>

          </div>


          {/* =================================================
              HEADING
          ================================================= */}

          <div className="login-heading">

            <span className="welcome-text">
              Welcome back
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your credentials to
              access your hospital dashboard.
            </p>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={handleLogin}
          >


            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="input-group">

              <label>
                Email Address
              </label>


              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>


                <input
                  type="email"
                  placeholder="admin@hospital.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="input-group">

              <label>
                Password
              </label>


              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>


                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  {showPassword
                    ? "Hide"
                    : "Show"}

                </button>

              </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="login-error">

                {error}

              </div>

            )}


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (

                <>

                  <span className="spinner"></span>

                  Signing in...

                </>

              ) : (

                <>

                  Sign In

                  <span>
                    →
                  </span>

                </>

              )}

            </button>

          </form>


          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="security-note">

            <span>
              🔐
            </span>


            <div>

              <strong>
                Secure Login
              </strong>

              <p>
                Your account is protected
                with secure authentication.
              </p>

            </div>

          </div>


        </div>

      </div>

    </div>

  );

}


export default Login;