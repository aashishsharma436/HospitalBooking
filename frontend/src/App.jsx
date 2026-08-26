import EditDoctor from "./pages/EditDoctor";
import DoctorManagement from "./pages/DoctorManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import ReceptionistManagement from "./pages/ReceptionistManagement";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import PatientRegistration from "./pages/PatientRegistration";
import PatientList from "./pages/PatientList";
import LiveTokenDisplay from "./pages/LiveTokenDisplay";

import HospitalDashboard from "./pages/HospitalDashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import HospitalAdminLayout from "./layouts/HospitalAdminLayout";

import { Routes, Route } from "react-router-dom";

import DoctorDashboard from "./pages/DoctorDashboard";
import AddDoctor from "./pages/AddDoctor";

import Footer from "./components/Footer";
import Trust from "./components/Trust";
import WhatsAppButton from "./components/WhatsAppButton";
import Booking from "./components/Booking";
import Doctors from "./components/Doctors";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";


function Home() {

    return (
        <>
            <Navbar />

            <Hero />

            <Booking />

            <Doctors />

            <Features />

            <Trust />

            <WhatsAppButton />

            <Footer />
        </>
    );

}


function App() {

    return (

        <Routes>

            {/* =========================
                LOGIN
            ========================= */}

            <Route
                path="/login"
                element={<Login />}
            />


            {/* =========================
                PUBLIC HOME
            ========================= */}

            <Route
                path="/"
                element={<Home />}
            />


            <Route
                path="/doctors"
                element={<Doctors />}
            />


            {/* =========================
                LIVE TOKEN DISPLAY
            ========================= */}

            <Route
                path="/token-display/:hospital_id/:doctor_id"
                element={<LiveTokenDisplay />}
            />


            {/* =========================
                HOSPITAL ADMIN PANEL
            ========================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "HospitalAdmin",
                            "SuperAdmin"
                        ]}
                    >
                        <HospitalAdminLayout />
                    </ProtectedRoute>
                }
            >

                <Route
                    path="/hospital-dashboard"
                    element={<HospitalDashboard />}
                />


                <Route
                    path="/doctor-management"
                    element={<DoctorManagement />}
                />


                <Route
                    path="/add-doctor"
                    element={<AddDoctor />}
                />


                <Route
                    path="/edit-doctor/:doctor_id"
                    element={<EditDoctor />}
                />


                <Route
                    path="/department-management"
                    element={<DepartmentManagement />}
                />


                <Route
                    path="/receptionist-management"
                    element={<ReceptionistManagement />}
                />

            </Route>


            {/* =========================
                DOCTOR DASHBOARD
            ========================= */}

            <Route
                path="/doctor-dashboard"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "Doctor",
                            "HospitalAdmin",
                            "SuperAdmin"
                        ]}
                    >
                        <DoctorDashboard />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                RECEPTIONIST DASHBOARD
            ========================= */}

            <Route
                path="/receptionist-dashboard"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "Receptionist"
                        ]}
                    >
                        <ReceptionistDashboard />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                PATIENT REGISTRATION
            ========================= */}

            <Route
                path="/patient-registration"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "Receptionist"
                        ]}
                    >
                        <PatientRegistration />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                PATIENT LIST
            ========================= */}

            <Route
                path="/patients"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "Receptionist"
                        ]}
                    >
                        <PatientList />
                    </ProtectedRoute>
                }
            />

        </Routes>

    );

}


export default App;