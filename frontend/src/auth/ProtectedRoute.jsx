import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {

    const { user } = useContext(AuthContext);

    // User login nahi hai
    if (!user) {
        return <Navigate to="/login" />;
    }

    // SuperAdmin ko full access
    if (user.role === "SuperAdmin") {
        return children;
    }

    // Role allowed nahi hai
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute;