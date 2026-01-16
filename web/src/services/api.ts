import axios from 'axios';

// Base Gateway URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if token is invalid/expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    validate: '/auth/validate',
  },
  orders: {
    base: '/orders',
    create: '/orders',
    getById: (id: string) => `/orders/${id}`,
    updateStatus: (id: string) => `/orders/${id}/status`,
  },
  tracking: {
    connect: '/tracking/ws', // WebSocket endpoint
    latest: (driverId: string) => `/tracking/${driverId}`,
  },
  pod: {
    upload: '/pod/upload',
    get: (orderId: string) => `/pod/${orderId}`,
  },
};

export default api;
