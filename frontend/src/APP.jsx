import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/app-routes';
import Preloader from './modules/preloader/preloader';
import UiNotificationHost from './components/ui-notification/ui-notification-host';

const PRELOADER_MIN_VISIBLE_MS = 700;
const PRELOADER_EXIT_MS = 420;

const App = () => {
    const [showPreloader, setShowPreloader] = useState(true);
    const [isPreloaderClosing, setIsPreloaderClosing] = useState(false);
    const isClosingRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const startTime = Date.now();
        let hideTimer = null;

        const closePreloader = () => {
            if (isClosingRef.current) {
                return;
            }

            isClosingRef.current = true;
            const elapsed = Date.now() - startTime;
            const remainingVisibleTime = Math.max(PRELOADER_MIN_VISIBLE_MS - elapsed, 0);

            window.setTimeout(() => {
                setIsPreloaderClosing(true);
                hideTimer = window.setTimeout(() => {
                    setShowPreloader(false);
                }, PRELOADER_EXIT_MS);
            }, remainingVisibleTime);
        };

        if (document.readyState === 'complete') {
            closePreloader();
        } else {
            window.addEventListener('load', closePreloader, { once: true });
        }

        return () => {
            if (hideTimer) {
                window.clearTimeout(hideTimer);
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
