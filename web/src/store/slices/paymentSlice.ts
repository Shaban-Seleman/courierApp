import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentService, PaymentIntentRequest } from '../../services/paymentService';

interface PaymentState {
  currentPayment: any | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PaymentState = {
  currentPayment: null,
  loading: false,
  error: null,
  success: false,
};

export const createPaymentIntent = createAsyncThunk(
  'payment/createIntent',
  async (data: PaymentIntentRequest, { rejectWithValue }) => {
    try {
      return await paymentService.createPaymentIntent(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate payment');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentPayment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.success = true;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
