import api from './api';

export const analyticsService = {
  getDriverStats: async (driverId: string) => {
    const response = await api.get(`/analytics/drivers/${driverId}`);
    return response.data;
  },
  
  // Future: Get system-wide stats for Admin
  getSystemStats: async () => {
    const response = await api.get('/analytics/system');
    return response.data;
  }
};
