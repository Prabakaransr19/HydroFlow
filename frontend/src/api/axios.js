import axios from 'axios';

/**
 * Custom Axios Instance
 * Base URL defaults to http://localhost:8080 or process env variable
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL && import.meta.env.PROD) throw new Error('VITE_API_BASE_URL must be configured for production.');

const axiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer Token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling and global 401 unauthorization handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const currentPath = window.location.pathname;
      if (!['/login', '/register', '/register/resident', '/resident/register', '/'].includes(currentPath)) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
