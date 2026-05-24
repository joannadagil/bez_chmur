import axios from 'axios';

const api = axios.create({
  baseURL: 'http://56.228.27.85:8000/api',
});

/**
 * Fetch public event instances from the Django API.
 */
export const getEvents = () => api.get('/event-instances/');
export default api;
