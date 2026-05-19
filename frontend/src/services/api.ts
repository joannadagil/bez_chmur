import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

/**
 * Fetch public event instances from the Django API.
 */
export const getEvents = () => api.get('/event-instances/');
export default api;
