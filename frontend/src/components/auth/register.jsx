import React from 'react';

const Register = () => {
    return (
        <div className="login-box">
            <h2 className="login-title">Реєстрація</h2>
            <form className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Логін:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Увійти</button>
            </form>

        </div>
            
    );
};

export default Register;
