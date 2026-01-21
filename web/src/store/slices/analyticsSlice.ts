import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/analyticsService';

interface AnalyticsState {
  driverStats: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  driverStats: null,
  loading: false,
  error: null,
};

export const fetchDriverStats = createAsyncThunk(
  'analytics/fetchDriverStats',
  async (driverId: string, { rejectWithValue }) => {
    try {
      return await analyticsService.getDriverStats(driverId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverStats.fulfilled, (state, action) => {
        state.loading = false;
        state.driverStats = action.payload;
      })
      .addCase(fetchDriverStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;
