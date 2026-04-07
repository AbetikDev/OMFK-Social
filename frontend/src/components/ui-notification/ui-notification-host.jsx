import React, { useEffect, useState } from 'react';

const NOTIFICATION_EVENT = 'omfk:ui-notification';
const MAX_VISIBLE_NOTIFICATIONS = 5;

const iconByVariant = {
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="ui-notification-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
    ),
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="ui-notification-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    ),
};

const UiNotificationHost = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handleNotification = (event) => {
            const nextNotification = event.detail;
            const timeoutMs = nextNotification?.timeoutMs || 4000;

            setNotifications((current) => {
                const nextVisible = [...current, nextNotification];
                return nextVisible.length > MAX_VISIBLE_NOTIFICATIONS ? nextVisible.slice(nextVisible.length - MAX_VISIBLE_NOTIFICATIONS) : nextVisible;
            });

            window.setTimeout(() => {
                setNotifications((current) => current.filter((item) => item.id !== nextNotification.id));
            }, timeoutMs);
        };

        window.addEventListener(NOTIFICATION_EVENT, handleNotification);
        return () => window.removeEventListener(NOTIFICATION_EVENT, handleNotification);
    }, []);

    return (
        <div className="ui-notification-stack" aria-live="polite" aria-atomic="true">
            {notifications.map((notification) => (
                <div key={notification.id} className={`ui-notification-card ui-notification-${notification.variant}`}>
                    <div className="ui-notification-left">
                        <div className={`ui-notification-icon-wrap ui-notification-icon-wrap-${notification.variant}`}>
                            {iconByVariant[notification.variant] || iconByVariant.error}
                        </div>
                        <div>
                            <p className="ui-notification-title">{notification.title}</p>
                            <p className="ui-notification-description">{notification.description}</p>
                        </div>
                    </div>
                    <button type="button" className="ui-notification-close" onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="ui-notification-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default UiNotificationHost;