import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let authToken = null;
let onUnauthorized = null;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token) {
  authToken = token || null;
}

export function clearAuthToken() {
  authToken = null;
}

export function registerUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === 'function' ? handler : null;
}

apiClient.interceptors.request.use((config) => {
  const nextConfig = { ...config };

  if (!nextConfig.headers) {
    nextConfig.headers = {};
  }

  if (authToken) {
    nextConfig.headers.Authorization = `Bearer ${authToken}`;
  }

  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthToken();

      if (onUnauthorized) {
        onUnauthorized();
      } else if (typeof window !== 'undefined') {
        window.localStorage.removeItem('smartseason_auth');
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);
