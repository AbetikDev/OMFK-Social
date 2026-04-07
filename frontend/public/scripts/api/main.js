import { clearAccessTokenCookie, readAccessToken, saveAccessToken } from '../cookie/main.js';

const API_BASE_URL = (window.OMFK_API_CONFIG?.baseURL || '/api').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = Number(window.OMFK_API_CONFIG?.timeoutMs || 12000);
const CLIENT_NAME = 'omfk-social-web';
const MIN_REQUEST_GAP_MS = 350;

const recentRequests = new Map();

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const createRequestId = () => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const joinUrl = (baseUrl, path) => {
	const normalizedPath = String(path || '').replace(/^\/+/, '');
	return `${baseUrl}/${normalizedPath}`;
};

const getThrottlingKey = (method, path, body) => {
	const payloadSeed = body ? JSON.stringify(body).slice(0, 60) : '';
	return `${method.toUpperCase()}:${path}:${payloadSeed}`;
};

const ensureRequestGap = (method, path, body) => {
	const key = getThrottlingKey(method, path, body);
	const now = Date.now();
	const lastRunAt = recentRequests.get(key) || 0;

	if (now - lastRunAt < MIN_REQUEST_GAP_MS) {
		return false;
	}

	recentRequests.set(key, now);
	return true;
};

const normalizeErrorMessage = (status) => {
	if (status === 400) return 'Некоректні дані запиту.';
	if (status === 401) return 'Потрібна авторизація.';
	if (status === 403) return 'Доступ заборонено.';
	if (status === 404) return 'Ресурс не знайдено.';
	if (status === 409) return 'Конфлікт даних. Спробуйте ще раз.';
	if (status === 422) return 'Помилка валідації даних.';
	if (status >= 500) return 'Помилка сервера. Спробуйте пізніше.';
	return 'Помилка запиту.';
};

export class ApiError extends Error {
	constructor(message, details = {}) {
		super(message);
		this.name = 'ApiError';
		this.status = details.status || 0;
		this.code = details.code || 'API_ERROR';
		this.details = details.details || null;
		this.requestId = details.requestId || null;
	}
}

class ApiClient {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
		this.accessToken = readAccessToken();
		this.refreshPromise = null;
	}

	setAccessToken(token) {
		this.accessToken = token || null;
		if (token) {
			saveAccessToken(token);
		}
	}

	clearAccessToken() {
		this.accessToken = null;
		clearAccessTokenCookie();
	}

	async refreshAccessToken() {
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		this.refreshPromise = this.request('POST', '/auth/refresh', {
			auth: false,
			retryAuth: false,
			body: {},
		})
			.then((payload) => {
				const nextToken = payload?.accessToken || null;
				this.setAccessToken(nextToken);
				return nextToken;
			})
			.catch((error) => {
				this.clearAccessToken();
				throw error;
			})
			.finally(() => {
				this.refreshPromise = null;
			});

		return this.refreshPromise;
	}

	async request(method, path, options = {}) {
		const {
			body,
			headers: customHeaders = {},
			auth = true,
			retryAuth = true,
			timeout = REQUEST_TIMEOUT_MS,
		} = options;

		if (!ensureRequestGap(method, path, body)) {
			throw new ApiError('Запит відправлено занадто швидко. Спробуйте ще раз.', {
				status: 429,
				code: 'CLIENT_THROTTLED',
			});
		}

		const headers = new Headers(customHeaders);
		const hasBody = typeof body !== 'undefined' && body !== null;
		const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
		const requestId = createRequestId();
		const controller = new AbortController();

		headers.set('Accept', headers.get('Accept') || 'application/json');
		headers.set('X-Request-Id', headers.get('X-Request-Id') || requestId);
		headers.set('X-Client-Name', headers.get('X-Client-Name') || CLIENT_NAME);

		if (auth && this.accessToken) {
			headers.set('Authorization', `Bearer ${this.accessToken}`);
		}

		let payload;
		if (hasBody) {
			if (isFormData) {
				payload = body;
			} else if (isObject(body) || Array.isArray(body)) {
				headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
				payload = JSON.stringify(body);
			} else {
				payload = body;
			}

			if (!headers.has('Idempotency-Key') && method !== 'GET') {
				headers.set('Idempotency-Key', createRequestId());
			}
		}

		const timeoutId = setTimeout(() => controller.abort(), timeout);

		let response;
		try {
			response = await fetch(joinUrl(this.baseUrl, path), {
				method,
				headers,
				credentials: 'include',
				body: payload,
				signal: controller.signal,
			});
		} catch (error) {
			clearTimeout(timeoutId);
			const isAbort = error?.name === 'AbortError';
			throw new ApiError(isAbort ? 'Час очікування запиту вичерпано.' : 'Неможливо підключитися до сервера.', {
				code: isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
			});
		}

		clearTimeout(timeoutId);

		const contentType = response.headers.get('content-type') || '';
		const isJson = contentType.includes('application/json');
		const parsed = isJson
			? await response.json().catch(() => null)
			: await response.text().catch(() => null);

		if (response.status === 401 && auth && retryAuth) {
			try {
				const refreshedToken = await this.refreshAccessToken();
				if (refreshedToken) {
					return this.request(method, path, {
						...options,
						retryAuth: false,
					});
				}
			} catch (_refreshError) {
				this.clearAccessToken();
			}
		}

		if (!response.ok) {
			const serverMessage = isObject(parsed) ? parsed.message : null;
			const serverCode = isObject(parsed) ? parsed.code : null;

			throw new ApiError(serverMessage || normalizeErrorMessage(response.status), {
				status: response.status,
				code: serverCode || `HTTP_${response.status}`,
				details: parsed,
				requestId: response.headers.get('x-request-id') || requestId,
			});
		}

		return parsed;
	}

	get(path, options = {}) {
		return this.request('GET', path, options);
	}

	post(path, body, options = {}) {
		return this.request('POST', path, { ...options, body });
	}
}

export const apiClient = new ApiClient(API_BASE_URL);
