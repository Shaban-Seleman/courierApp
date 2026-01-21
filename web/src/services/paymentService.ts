import api from './api';

export interface PaymentIntentRequest {
    orderId: string;
    amount: number;
    currency: string;
}

export const paymentService = {
  createPaymentIntent: async (data: PaymentIntentRequest) => {
    const response = await api.post('/payments/create-intent', data);
    return response.data;
  }
};
