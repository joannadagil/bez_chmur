import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

/**
 * Shared Axios client for authenticated backend API requests.
 *
 * The client uses `VITE_API_URL` when provided and falls back to the Vite proxy
 * `/api` path. A JWT access token from local storage is attached automatically.
 */
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default apiClient;
