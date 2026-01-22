import api from './api';

export const orderService = {
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getAvailableOrders: async () => {
    const response = await api.get('/orders/available');
    return response.data;
  },

  getDriverOrders: async () => {
    const response = await api.get('/orders/assigned');
    return response.data;
  },

  updateStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/orders/${orderId}/status?status=${status}`);
    return response.data;
  },

  assignDriver: async (orderId: string, driverId: string) => {
    const response = await api.put(`/orders/${orderId}/assign/${driverId}`);
    return response.data;
  }
};
