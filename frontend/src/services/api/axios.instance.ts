import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@/constants/api.constants';

// ============================================================
// Axios Instance
// ============================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================================================
// Request Interceptor - Attach Auth Token
// ============================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (storageError) {
      // localStorage can throw in private-browsing / storage-disabled contexts.
      // Non-fatal: just proceed without the auth header rather than
      // blocking the request entirely.
      console.warn('[apiClient] Unable to read access_token from storage:', storageError);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response Interceptor - Handle Errors & Token Refresh
// ============================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          localStorage.setItem('access_token', data.access_token);

          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>).Authorization =
              `Bearer ${data.access_token}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh itself failed (expired/invalid refresh token, or storage
        // unavailable) — clear whatever tokens we have and force re-login.
        // This must never throw further; we're already in an error handler.
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        } catch {
          // Storage unavailable — nothing more we can do here.
        }

        console.warn('[apiClient] Token refresh failed, redirecting to login:', refreshError);
        window.location.href = '/login';

        // Return a rejected promise so callers awaiting this request
        // don't hang or receive `undefined` as if it succeeded.
        return Promise.reject(refreshError);
      }
    }

    // Log every failed request centrally for easier debugging, without
    // blocking the rejection from reaching the caller (React Query, etc.)
    if (import.meta.env.DEV) {
      console.error(
        `[apiClient] ${originalRequest?.method?.toUpperCase() ?? 'REQUEST'} ${originalRequest?.url ?? ''} failed:`,
        error.response?.status,
        error.response?.data ?? error.message
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;