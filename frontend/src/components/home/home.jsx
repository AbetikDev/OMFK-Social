import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';
import { logout } from '../../services/auth';
import { notifySuccess } from '../../utils/notifications';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Головна | ОМФK';
    }, []);

    const handleLogout = () => {
        logout();
        notifySuccess('Ви вийшли з акаунта.');
        navigate(ROUTES.LOGIN, { replace: true });
    };

    return (
        <main className="home-page">
            <section className="home-hero">
                <p className="home-kicker">OMFK Social</p>
                <h1 className="home-title">Ви успішно увійшли до системи</h1>
                <p className="home-description">
                    Після успішної реєстрації або авторизації користувач потрапляє
                    на головну сторінку.
                </p>
                <button type="button" className="home-logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </section>
        </main>
    );
};

export default Home;
