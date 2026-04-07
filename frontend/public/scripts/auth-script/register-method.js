import { apiClient } from '../api/main.js';

export const registerMethod = async ({ email, username, password }) => {
    return apiClient.post('/auth/register', { email, username, password }, { auth: false });
};
