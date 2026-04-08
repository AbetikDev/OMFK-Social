import { apiClient } from '../lib/api';

const AUTH_STATE_KEY = 'omfk-authenticated';

const setAuthenticated = (value) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (value) {
    window.localStorage.setItem(AUTH_STATE_KEY, 'true');
  } else {
    window.localStorage.removeItem(AUTH_STATE_KEY);
  }
};

export const register = ({ email, username, password }) => {
  return apiClient.post('/auth/register', {
    mail: email,
    username,
    password,
  }).then((payload) => {
    setAuthenticated(Boolean(payload?.user));
    return payload;
  });
};

export const login = ({ login, password }) => {
  return apiClient.post('/auth/login', {
    login,
    password,
  }).then((payload) => {
    setAuthenticated(Boolean(payload?.accessToken || payload?.user));
    return payload;
  });
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(AUTH_STATE_KEY) === 'true';
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STATE_KEY);
    window.localStorage.removeItem('omfk-access-token');
    window.sessionStorage.removeItem('omfk-access-token');
  }
};
