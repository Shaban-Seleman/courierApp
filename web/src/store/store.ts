import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import trackingReducer from './slices/trackingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    tracking: trackingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;