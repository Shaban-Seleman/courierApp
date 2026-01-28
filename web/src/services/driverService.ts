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

  updateDriverStatus: async (status: string) => {
    const response = await api.put(`/drivers/status?status=${status}`);
    return response.data;
  },

  updateProfile: async (profileData: { vehicleType: string; licensePlate: string }) => {
    const response = await api.put('/drivers/profile', profileData);
    return response.data;
  },

  getAllDrivers: async () => {
    const response = await api.get('/drivers');
    return response.data;
  }
};
