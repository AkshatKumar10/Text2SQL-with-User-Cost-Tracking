import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('text2sql_auth_token');

    if (
      token &&
      !config.url?.includes('/api/auth/google')
    ) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (
      status === 401 &&
      !requestUrl.includes('/api/auth/google')
    ) {
      localStorage.removeItem('text2sql_auth_token');

      const protectedPaths = [
        '/query',
        '/dashboard',
        '/schema',
        '/sql-console',
        '/dataset',
      ];

      if (protectedPaths.includes(window.location.pathname)) {
        window.location.replace('/');
      }
    }

    return Promise.reject(error);
  }
);

export default api;