import api from './api';

export const driverService = {
  createProfile: async (profileData: { vehicleType: string; licensePlate: string }) => {
    const response = await api.post('/drivers/profile', profileData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/drivers/profile');
    return response.data;
  },

  toggleStatus: async (status: 'ONLINE' | 'OFFLINE' | 'BUSY') => {
    const response = await api.put(`/drivers/status?status=${status}`);
    return response.data;
  }
};
