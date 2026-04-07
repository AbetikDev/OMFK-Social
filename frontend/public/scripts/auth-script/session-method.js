import { apiClient } from '../api/main.js';

export const meMethod = async () => {
    return apiClient.get('/auth/me');
};

export const logoutMethod = async () => {
    try {
        return await apiClient.post('/auth/logout', {});
    } finally {
        apiClient.clearAccessToken();
    }
};
