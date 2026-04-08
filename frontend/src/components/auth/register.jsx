import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';
import { register } from '../../services/auth';
import { notifySuccess, notifyTryAgain } from '../../utils/notifications';

const Register = () => {
    const [pending, setPending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Реєстрація | ОМФK';
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const email = String(formData.get('email') || '').trim();
        const username = String(formData.get('username') || '').trim();
        const password = String(formData.get('password') || '');

        if (!email || !username || !password) {
            notifyTryAgain('Заповніть усі поля.');
            return;
        }

        setPending(true);
        try {
            await register({ email, username, password });
            notifySuccess('Реєстрація успішна. Тепер увійдіть у систему.');
            form.reset();
            navigate(ROUTES.HOME, { replace: true });
        } catch (error) {
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
