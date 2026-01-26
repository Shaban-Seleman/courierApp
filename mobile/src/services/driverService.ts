import api from './auth'; // Utilizing the configured axios instance

export const driverService = {
  getProfile: async () => {
    const response = await api.get('/drivers/profile');
    return response.data;
  },

  createProfile: async (vehicleType: string, licensePlate: string) => {
    const response = await api.post('/drivers/profile', { vehicleType, licensePlate });
    return response.data;
  },

  updateStatus: async (status: 'ONLINE' | 'OFFLINE') => {
    const response = await api.put(`/drivers/status?status=${status}`);
    return response.data;
  },

  getAssignedOrders: async () => {
    const response = await api.get('/orders/assigned');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/orders/${orderId}/status?status=${status}`);
    return response.data;
  },
  
  uploadPoD: async (orderId: string, signatureBase64: string, photoUri: string) => {
    const formData = new FormData();
    formData.append('orderId', orderId);
    
    // Signature (Base64 Data URI)
    formData.append('signature', {
        uri: signatureBase64, 
        type: 'image/png',
        name: 'signature.png'
    } as any); 
    
    // Photo (File URI)
    const filename = photoUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('photo', {
        uri: photoUri, 
        type: type,
        name: filename || 'photo.jpg'
    } as any);

    const response = await api.post(`/pod/upload/${orderId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
  }
};
