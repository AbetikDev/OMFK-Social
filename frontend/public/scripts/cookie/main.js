const ACCESS_TOKEN_COOKIE = 'omfk_access_token';
const CONSENT_COOKIE = 'omfk_cookie_consent';

const DEFAULT_SECURE = window.location.protocol === 'https:';

const toCookieString = (name, value, options = {}) => {
    const {
        days = 7,
        path = '/',
        sameSite = 'Lax',
        secure = DEFAULT_SECURE,
    } = options;

    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(String(value));

    let cookie = `${encodedName}=${encodedValue}; Expires=${expires}; Path=${path}; SameSite=${sameSite}`;
    if (secure) {
        cookie += '; Secure';
    }

    return cookie;
};

export const setCookie = (name, value, options = {}) => {
    document.cookie = toCookieString(name, value, options);
};

export const getCookie = (name) => {
    const encodedName = encodeURIComponent(name);
    const pairs = document.cookie ? document.cookie.split('; ') : [];

    for (const pair of pairs) {
        const [key, ...rest] = pair.split('=');
        if (key === encodedName) {
            return decodeURIComponent(rest.join('='));
        }
    }

    return null;
};

export const deleteCookie = (name, options = {}) => {
    const path = options.path || '/';
    const encodedName = encodeURIComponent(name);
    document.cookie = `${encodedName}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}; SameSite=Lax`;
};

export const saveAccessToken = (token) => {
    if (!token) return;
    setCookie(ACCESS_TOKEN_COOKIE, token, { days: 1 });
};

export const readAccessToken = () => getCookie(ACCESS_TOKEN_COOKIE);

export const clearAccessTokenCookie = () => {
    deleteCookie(ACCESS_TOKEN_COOKIE);
};

export const setCookieConsent = (accepted) => {
    setCookie(CONSENT_COOKIE, accepted ? 'accepted' : 'declined', { days: 180 });
};

export const getCookieConsent = () => getCookie(CONSENT_COOKIE);

export const getCookieBannerConfig = () => ({
    title: 'Your privacy is important to us',
    description:
        'We process your personal information to measure and improve our sites and services, to assist campaigns and provide personalized content.',
    classes: {
        wrapper: '[--shadow:rgba(60,64,67,0.3)_0_1px_2px_0,rgba(60,64,67,0.15)_0_2px_6px_2px] w-4/5 h-auto rounded-2xl bg-white [box-shadow:var(--shadow)] max-w-[300px]',
        body: 'flex flex-col items-center justify-between pt-9 px-6 pb-6 relative',
        acceptButton:
            'absolute font-semibold right-6 bottom-6 cursor-pointer py-2 px-8 w-max break-keep text-sm rounded-lg transition-colors text-[#634647] hover:text-[#ddad81] bg-[#ddad81] hover:bg-[#634647]',
    },
});
