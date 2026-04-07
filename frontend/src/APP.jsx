import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/app-routes';
import Preloader from './modules/preloader/preloader';
import UiNotificationHost from './components/ui-notification/ui-notification-host';

const PRELOADER_APPEAR_DELAY_MS = 120;
const PRELOADER_EXIT_MS = 560;

const App = () => {
    const [showPreloader, setShowPreloader] = useState(false);
    const [isPreloaderClosing, setIsPreloaderClosing] = useState(false);
    const isPreloaderVisibleRef = useRef(false);

    useEffect(() => {
        isPreloaderVisibleRef.current = showPreloader;
    }, [showPreloader]);

    useEffect(() => {
        if (typeof window === 'undefined' || document.readyState === 'complete') {
            return undefined;
        }

        let appearTimer = window.setTimeout(() => {
            setShowPreloader(true);
        }, PRELOADER_APPEAR_DELAY_MS);

        let hidePreloaderTimer = null;

        const closePreloader = () => {
            window.clearTimeout(appearTimer);

            if (!isPreloaderVisibleRef.current) {
                return;
            }

            setIsPreloaderClosing(true);
            hidePreloaderTimer = window.setTimeout(() => {
                setShowPreloader(false);
                setIsPreloaderClosing(false);
            }, PRELOADER_EXIT_MS);
        };

        window.addEventListener('load', closePreloader, { once: true });

        return () => {
            window.clearTimeout(appearTimer);

            if (hidePreloaderTimer) {
                clearTimeout(hidePreloaderTimer);
            }

            window.removeEventListener('load', closePreloader);
        };
    }, []);

    return (
        <BrowserRouter>
            {showPreloader ? <Preloader isClosing={isPreloaderClosing} /> : null}
            <UiNotificationHost />
            <div className="app-container">
                <AppRoutes />
            </div>
        </BrowserRouter>
    );
};

export default App;
