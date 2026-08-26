import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import "../css/hospitaladminlayout.css";

function HospitalAdminLayout() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="hospital-admin-layout">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="hospital-sidebar">

                {/* Brand */}
                <div className="hospital-brand">

                    <div className="brand-logo">
                        S
                    </div>

                    <div>
                        <h2>SARITEC</h2>
                        <span>Healthcare</span>
                    </div>

                </div>


                {/* Menu Title */}
                <div className="sidebar-section-title">
                    MAIN MENU
                </div>


                {/* Navigation */}
                <nav className="hospital-nav">

                    {/* Dashboard */}
                    <NavLink
                        to="/hospital-dashboard"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-item active"
                                : "nav-item"
                        }
                    >
                        <span>🏠</span>
                        Dashboard
                    </NavLink>


                    {/* Doctors */}
                    <NavLink
                        to="/doctor-management"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-item active"
                                : "nav-item"
                        }
                    >
                        <span>👨‍⚕️</span>
                        Doctors
                    </NavLink>


                    {/* Departments */}
                    <NavLink
                        to="/department-management"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-item active"
                                : "nav-item"
                        }
                    >
                        <span>🏥</span>
                        Departments
                    </NavLink>


                    {/* Receptionists */}
                    <NavLink
                        to="/receptionist-management"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-item active"
                                : "nav-item"
                        }
                    >
                        <span>👥</span>
                        Receptionists
                    </NavLink>


                    {/* Appointments */}
                    <button
                        className="nav-item disabled-nav"
                        onClick={() =>
                            alert(
                                "Appointments Management coming soon"
                            )
                        }
                    >
                        <span>📅</span>
                        Appointments
                    </button>


                    {/* Token Management */}
                    <button
                        className="nav-item disabled-nav"
                        onClick={() =>
                            alert(
                                "Token Management coming soon"
                            )
                        }
                    >
                        <span>🎫</span>
                        Token Management
                    </button>

                </nav>


                {/* =========================
                    SIDEBAR BOTTOM
                ========================= */}

                <div className="sidebar-bottom">

                    {/* Admin Profile */}
                    <div className="admin-profile">

                        <div className="admin-avatar">
                            A
                        </div>

                        <div className="admin-info">

                            <strong>
                                Hospital Admin
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>


                    {/* Logout */}
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="hospital-main-content">

                {/* Topbar */}
                <div className="hospital-topbar">

                    <div>

                        <h3>
                            SARITEC Healthcare
                        </h3>

                        <p>
                            Smart Hospital Management System
                        </p>

                    </div>


                    {/* System Status */}
                    <div className="topbar-status">

                        <span className="status-dot"></span>

                        System Online

                    </div>

                </div>


                {/* Dynamic Page Content */}
                <div className="hospital-page-content">

                    <Outlet />

                </div>

            </main>

        </div>
    );
}

export default HospitalAdminLayout;