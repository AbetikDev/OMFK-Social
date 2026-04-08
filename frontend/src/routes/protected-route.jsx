import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import { ROUTES } from './routes';

const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return children;
};

export default ProtectedRoute;
