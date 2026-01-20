import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Activity {
  id: string;
  type: string; // e.g., "ORDER_CREATED", "ORDER_ASSIGNED", "ORDER_DELIVERED"
  description: string;
  timestamp: string;
}

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [],
  loading: false,
  error: null,
};

export const fetchRecentActivities = createAsyncThunk(
  'activities/fetchRecentActivities',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
                  const response = await api.get(`/orders/recent?limit=${limit}`);      // For now, we only have order-related activities.
      // In a real scenario, this might be a combined endpoint or multiple calls.
      const orderActivities: Activity[] = response.data.map((order: any) => ({
        id: order.id,
        type: `ORDER_${order.status}`, // Simple mapping for now
        description: `Order #${order.id.substring(0, 8)} ${order.status.toLowerCase()}`,
        timestamp: order.createdAt, // Or order.updatedAt for status changes
      }));
      return orderActivities;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default activitySlice.reducer;
