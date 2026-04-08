import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const getEvents = () => api.get('/event-instances/');
export default api;