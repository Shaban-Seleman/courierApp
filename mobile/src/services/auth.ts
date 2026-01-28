import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with 'http://10.0.2.2:8080/api/v1' for Android Emulator
// Replace with your local IP (e.g., http://192.168.x.x:8080/api/v1) for physical devices
const API_URL = 'http://192.168.0.43:8080/api/v1';

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
    // Backend expects 'email', so we map 'username' to 'email'
    const response = await api.post('/auth/login', { email: username, password });
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
