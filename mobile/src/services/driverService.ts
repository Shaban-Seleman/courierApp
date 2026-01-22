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
  
  uploadPoD: async (orderId: string, signatureBase64: string) => {
    const formData = new FormData();
    formData.append('orderId', orderId);
    
    // For React Native, when using base64 for file upload, the 'uri' should correctly represent
    // the data type. The `react-native-signature-canvas` returns a data URI.
    // Spring's MultipartFile can often handle this directly if the data is correctly encoded.

    // Using signatureBase64 for both signature and a placeholder photo for now
    formData.append('signature', {
        uri: signatureBase64, // This is already a data URI (data:image/png;base64,...)
        type: 'image/png',
        name: 'signature.png'
    } as any); 
    
    // Placeholder photo: use a default asset or another input if a real photo is required
    // For now, we'll reuse the signature as a placeholder for the photo as well.
    formData.append('photo', {
        uri: signatureBase64, 
        type: 'image/png',
        name: 'photo.jpg'
    } as any);

    const response = await api.post(`/api/v1/pod/upload/${orderId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
  }
};
