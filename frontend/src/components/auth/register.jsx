import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';
import { loadNotificationModule, loadRegisterModule } from './runtime-modules';

const Register = () => {
    const [pending, setPending] = useState(false);
    useEffect(() => {
        document.title = "Реєстрація | ОМФK";
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get('email') || '').trim();
        const username = String(formData.get('username') || '').trim();
        const password = String(formData.get('password') || '');

        if (!email || !username || !password) {
            const { notifyTryAgain } = await loadNotificationModule();
            notifyTryAgain('Заповніть усі поля.');
            return;
        }

        setPending(true);
        try {
            const { registerMethod } = await loadRegisterModule();
            const { notifySuccess } = await loadNotificationModule();
            await registerMethod({ email, username, password });
            notifySuccess('Реєстрація успішна. Тепер увійдіть у систему.');
            event.currentTarget.reset();
        } catch (error) {
            const { notifyTryAgain } = await loadNotificationModule();
            if (error?.name === 'ApiError') {
                notifyTryAgain(error.message);
            } else {
                notifyTryAgain('Сталася помилка реєстрації.');
            }
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="login-container">
            <img src="/images/components/logo/logo_dark.png" alt="Social Logo" className="login-logo" />
            <h2 className="login-title">Реєстрація</h2>
            <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="email">Електронна пошта:</label>
                    <input className="form-control" type="email" id="email" name="email" autoComplete="email" required />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Ім'я користувача:</label>
                    <input className="form-control" type="text" id="username" name="username" autoComplete="username" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input className="form-control" type="password" id="password" name="password" autoComplete="new-password" required />
                </div>
                <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-link">Забули пароль?</Link>
                <button type="submit" className="btn btn-primary" disabled={pending}>
                    {pending ? 'Реєстрація...' : 'Зареєструватися'}
                </button>
                <Link to={ROUTES.LOGIN} className="login-link">Вже є акаунт? Увійти</Link>
            </form>
        </div>
    );
};

export default Register;
