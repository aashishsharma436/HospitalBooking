import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import "../css/dashboard.css";

function HospitalDashboard() {
    const [stats, setStats] = useState({
        total_doctors: 0,
        total_patients: 0,
        today_appointments: 0,
        waiting_tokens: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/hospital-dashboard/1"
                );

                console.log(
                    "HOSPITAL DASHBOARD:",
                    response.data
                );

                setStats(response.data);
            } catch (error) {
                console.error(
                    "DASHBOARD ERROR:",
                    error
                );

                setError(
                    error.response?.data?.detail ||
                    "Dashboard load nahi ho paaya."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    return (
        <div className="dashboard">

            <div className="dashboard-header">
                <div>
                    <h1>Hospital Admin Dashboard</h1>

                    <p>
                        Manage your hospital from one place
                    </p>
                </div>
            </div>

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="dashboard-loading">
                    Loading Dashboard...
                </div>
            ) : (
                <div className="stats">

                    <div className="card">
                        <div className="card-icon">
                            👨‍⚕️
                        </div>

                        <div>
                            <p>Total Doctors</p>
                            <h2>
                                {stats.total_doctors}
                            </h2>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-icon">
                            🧑‍🤝‍🧑
                        </div>

                        <div>
                            <p>Total Patients</p>
                            <h2>
                                {stats.total_patients}
                            </h2>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-icon">
                            📅
                        </div>

                        <div>
                            <p>Today's Appointments</p>
                            <h2>
                                {stats.today_appointments}
                            </h2>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-icon">
                            🎫
                        </div>

                        <div>
                            <p>Waiting Tokens</p>
                            <h2>
                                {stats.waiting_tokens}
                            </h2>
                        </div>
                    </div>

                </div>
            )}

            <div className="dashboard-section">

                <div className="section-header">
                    <div>
                        <h2>Quick Actions</h2>

                        <p>
                            Hospital management ke important
                            sections
                        </p>
                    </div>
                </div>

                <div className="actions">

                    <Link
                        to="/doctor-management"
                        className="action-card"
                    >
                        <div className="action-icon">
                            👨‍⚕️
                        </div>

                        <div>
                            <h3>
                                Manage Doctors
                            </h3>

                            <p>
                                Add, view aur manage doctors
                            </p>
                        </div>

                        <span>→</span>
                    </Link>

                    <Link
                        to="/department-management"
                        className="action-card"
                    >
                        <div className="action-icon">
                            🏥
                        </div>

                        <div>
                            <h3>
                                Manage Departments
                            </h3>

                            <p>
                                Hospital departments manage karein
                            </p>
                        </div>

                        <span>→</span>
                    </Link>

                    <button className="action-card">
                        <div className="action-icon">
                            👥
                        </div>

                        <div>
                            <h3>
                                Manage Receptionists
                            </h3>

                            <p>
                                Reception staff manage karein
                            </p>
                        </div>

                        <span>→</span>
                    </button>

                    <button className="action-card">
                        <div className="action-icon">
                            📋
                        </div>

                        <div>
                            <h3>
                                View Appointments
                            </h3>

                            <p>
                                Today's appointments dekhein
                            </p>
                        </div>

                        <span>→</span>
                    </button>

                    <button className="action-card">
                        <div className="action-icon">
                            🎫
                        </div>

                        <div>
                            <h3>
                                Token Management
                            </h3>

                            <p>
                                Patient tokens manage karein
                            </p>
                        </div>

                        <span>→</span>
                    </button>

                </div>

            </div>

        </div>
    );
}

export default HospitalDashboard;