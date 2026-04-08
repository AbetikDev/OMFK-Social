const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 12000;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const joinUrl = (baseUrl, route) => {
  const normalizedRoute = String(route || '').replace(/^\/+/, '');
  return `${baseUrl}/${normalizedRoute}`;
};

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = details.status || 0;
    this.code = details.code || 'API_ERROR';
    this.details = details.details || null;
  }
}

class ApiClient {
  async request(method, route, { body, headers = {} } = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(joinUrl(API_BASE_URL, route), {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...headers,
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = isObject(payload) ? payload.message : 'Request failed';
        throw new ApiError(message, {
          status: response.status,
          code: isObject(payload) ? payload.code : `HTTP_${response.status}`,
          details: payload,
        });
      }

      return payload;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new ApiError('Час очікування запиту вичерпано.', {
          code: 'REQUEST_TIMEOUT',
        });
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Не вдалося підключитися до сервера.', {
        code: 'NETWORK_ERROR',
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  post(route, body, options) {
    return this.request('POST', route, {
      ...options,
      body,
    });
  }
}

export const apiClient = new ApiClient();
