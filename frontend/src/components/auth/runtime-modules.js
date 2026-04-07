const loadScriptModule = async (relativePath) => {
    const url = new URL(relativePath, window.location.origin).href;
    return import(/* @vite-ignore */ url);
};

export const loadNotificationModule = () => loadScriptModule('/scripts/ui-notification/main.js');
export const loadLoginModule = () => loadScriptModule('/scripts/auth-script/login-method.js');
export const loadRegisterModule = () => loadScriptModule('/scripts/auth-script/register-method.js');