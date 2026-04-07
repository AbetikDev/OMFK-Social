import React, { useEffect } from 'react';

const Login = () => {
    useEffect(() => {
        document.title = "Авторизація | ОМФK";
    }, []);
    return (
        <div className="login-container">
            <img src="/images/components/logo/logo_dark.png" alt="Social Logo" className="login-logo" />
            <h2 className="login-title">Авторизація</h2>
            <form className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Логін:</label>
                    <input className="form-control" type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input className="form-control" type="password" id="password" name="password" required />
                </div>
                <a href="/forgot-password" className="forgot-link">Забули пароль?</a>
                <button type="submit" className="btn btn-primary">Увійти</button>
                <a href="/register" className="register-link">Немає акаунта? Зареєструватися</a>
            </form>
        </div>
    );
};

export default Login;
