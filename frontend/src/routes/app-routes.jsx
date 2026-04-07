import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NotFound from '../components/404/404';
import { Login, Register } from '../components/auth/main';
import { ROUTES } from './routes';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;