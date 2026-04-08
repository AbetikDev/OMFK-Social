import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';
import { login } from '../../services/auth';
import { notifySuccess, notifyTryAgain } from '../../utils/notifications';

const Login = () => {
    const [pending, setPending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Авторизація | ОМФK';
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const loginValue = String(formData.get('login') || '').trim();
        const password = String(formData.get('password') || '');

        if (!loginValue || !password) {
            notifyTryAgain('Вкажіть логін і пароль.');
            return;
        }

        setPending(true);
        try {
            await login({ login: loginValue, password });
            notifySuccess('Вхід успішний. Можна відкривати захищені сторінки.');
            form.reset();
            navigate(ROUTES.HOME, { replace: true });
        } catch (error) {
            if (error?.name === 'ApiError') {
                notifyTryAgain(error.message);
            } else {
                notifyTryAgain('Сталася помилка авторизації.');
            }
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="login-container">
            <img src="/images/components/logo/logo_dark.png" alt="Social Logo" className="login-logo" />
            <h2 className="login-title">Авторизація</h2>
            <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="login">Логін:</label>
                    <input className="form-control" type="text" id="login" name="login" autoComplete="username" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input className="form-control" type="password" id="password" name="password" autoComplete="current-password" required />
                </div>
                <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-link">Забули пароль?</Link>
                <button type="submit" className="btn btn-primary" disabled={pending}>
                    {pending ? 'Вхід...' : 'Увійти'}
                </button>
                <Link to={ROUTES.REGISTER} className="register-link">Немає акаунта? Зареєструватися</Link>
            </form>
        </div>
    );
};

export default Login;
