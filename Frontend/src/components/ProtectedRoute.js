import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const userRole = localStorage.getItem('userRole');
    const location = useLocation();

    if (userRole !== 'admin') {
        // Redirect non-admin users or show a message
        return <Navigate to="/user-home" state={{ from: location }} replace />;
    }

    return children; // Render the component for admin users
};

export default ProtectedRoute;
