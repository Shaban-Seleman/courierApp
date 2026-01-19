import api from './api';

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const payload = {
        email: credentials.username,
        password: credentials.password
    };
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  
  register: async (userData: { username: string; email: string; password: string; role: string }) => {
    const payload = {
        fullName: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role
    };
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
