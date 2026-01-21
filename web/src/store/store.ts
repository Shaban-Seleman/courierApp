import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import driverReducer from './slices/driverSlice';
import activityReducer from './slices/activitySlice';
import analyticsReducer from './slices/analyticsSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    driver: driverReducer,
    activity: activityReducer,
    analytics: analyticsReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;