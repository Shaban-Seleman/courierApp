import api from './api';

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current Page
}

export const orderService = {
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async (page = 0, size = 10) => {
    const response = await api.get(`/orders?page=${page}&size=${size}`);
    return response.data;
  },

  getAvailableOrders: async (page = 0, size = 10) => {
    const response = await api.get(`/orders/available?page=${page}&size=${size}`);
    return response.data;
  },

  getDriverOrders: async (page = 0, size = 10) => {
    const response = await api.get(`/orders/assigned?page=${page}&size=${size}`);
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
