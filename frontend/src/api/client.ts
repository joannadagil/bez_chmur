import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
