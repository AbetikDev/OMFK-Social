const NOTIFICATION_EVENT = 'omfk:ui-notification';

const createNotification = (variant, description) => ({
  id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  variant,
  title: variant === 'success' ? 'Success' : 'Please try again',
  description,
  timeoutMs: 4000,
});

const emit = (payload) => {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: payload }));
};

export const notifySuccess = (description) => emit(createNotification('success', description));
export const notifyTryAgain = (description) => emit(createNotification('error', description));
