import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import NotFound from '../components/404/404';
import { Login, Register } from '../components/auth/main';
import Home from '../components/home/home';
import ProtectedRoute from './protected-route';
import { ROUTES } from './routes';

const AuthScreen = ({ children }) => {
    const location = useLocation();

    return (
        <div key={location.pathname} className="auth-route-shell auth-route-enter">
            {children}
        </div>
    );
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path={ROUTES.HOME} element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path={ROUTES.LOGIN} element={<AuthScreen><Login /></AuthScreen>} />
            <Route path={ROUTES.REGISTER} element={<AuthScreen><Register /></AuthScreen>} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<AuthScreen><Login /></AuthScreen>} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
