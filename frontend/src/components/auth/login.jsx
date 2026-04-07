import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';
import { loadLoginModule, loadNotificationModule } from './runtime-modules';

const Login = () => {
    const [pending, setPending] = useState(false);
    useEffect(() => {
        document.title = "Авторизація | ОМФK";
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const login = String(formData.get('login') || '').trim();
        const password = String(formData.get('password') || '');

        if (!login || !password) {
            const { notifyTryAgain } = await loadNotificationModule();
            notifyTryAgain('Вкажіть логін і пароль.');
            return;
        }

        setPending(true);
        try {
            const { loginMethod } = await loadLoginModule();
            const { notifySuccess } = await loadNotificationModule();
            await loginMethod({ login, password });
            notifySuccess('Вхід успішний. Можна відкривати захищені сторінки.');
            event.currentTarget.reset();
        } catch (error) {
            const { notifyTryAgain } = await loadNotificationModule();
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
