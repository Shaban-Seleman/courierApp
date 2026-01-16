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
    // Convert base64 to Blob/File for upload if backend expects multipart
    // For React Native, we typically use FormData with uri/type/name
    
    // NOTE: This implementation assumes the backend expects multipart/form-data
    // You might need a utility to convert the base64 signature to a file object 
    // compatible with React Native's FormData.
    
    // Placeholder for simple implementation:
    const formData = new FormData();
    formData.append('orderId', orderId);
    
    // Remove header if present (data:image/png;base64,...)
    const cleanSignature = signatureBase64.replace('data:image/png;base64,', '');
    
    formData.append('signature', {
        uri: `data:image/png;base64,${cleanSignature}`,
        type: 'image/png',
        name: 'signature.png'
    } as any); 
    
    // Dummy photo
    formData.append('photo', {
        uri: `data:image/png;base64,${cleanSignature}`, // Reusing sig as placeholder
        type: 'image/png',
        name: 'photo.jpg'
    } as any);

    const response = await api.post('/pod', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data: any) => data,
    });
    return response.data;
  }
};
    return response.data;
  }
};
