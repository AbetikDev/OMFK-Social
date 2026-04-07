export const NOTIFICATION_EVENT = 'omfk:ui-notification';

const defaultTimeoutMs = 4000;

const emitNotification = (payload) => {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: payload }));
};

export const showNotification = (payload) => {
    emitNotification({
        id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timeoutMs: payload?.timeoutMs || defaultTimeoutMs,
        ...payload,
    });
};

export const getTryAgainNotification = (description = 'This is the description part') => ({
    variant: 'error',
    title: 'Please try again',
    description,
    timeoutMs: defaultTimeoutMs,
});

export const getSuccessNotification = (description = 'The action was completed successfully') => ({
    variant: 'success',
    title: 'Success',
    description,
    timeoutMs: defaultTimeoutMs,
});

export const notifyTryAgain = (description) => showNotification(getTryAgainNotification(description));
export const notifySuccess = (description) => showNotification(getSuccessNotification(description));
