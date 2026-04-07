import { apiClient } from '../api/main.js';

export const loginMethod = async ({ login, password }) => {
    const payload = await apiClient.post('/auth/login', { login, password }, { auth: false });

    if (payload?.accessToken) {
        apiClient.setAccessToken(payload.accessToken);
    }

    return payload;
};
