import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace 'localhost' with your machine's local IP address for physical devices
// or '10.0.2.2' for Android Emulator
// or 'localhost' for iOS Simulator
const API_URL = 'http://192.168.1.100:8080/api/v1'; // Update this with your actual IP

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  register: async (username, email, password, role = 'DRIVER') => {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default api;
