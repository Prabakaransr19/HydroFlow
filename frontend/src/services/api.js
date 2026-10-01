import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL && import.meta.env.PROD) throw new Error('VITE_API_BASE_URL must be configured for production.');

const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Auth and Server Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/register/resident', '/resident/register', '/'].includes(currentPath)) {
          window.location.href = '/login?expired=true';
        }
      } else if (error.response.status === 403) {
        console.warn('Access denied to resource');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
