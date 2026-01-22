import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driverService } from '../../services/driverService';

export enum DriverStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    BUSY = 'BUSY'
}

export interface DriverProfile {
    id: string;
    userId: string;
    vehicleType: string;
    licensePlate: string;
    status: DriverStatus;
    currentLatitude?: number;
    currentLongitude?: number;
}

interface DriverState {
    profile: DriverProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: DriverState = {
    profile: null,
    loading: false,
    error: null,
};

export const fetchDriverProfile = createAsyncThunk(
    'driver/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            return await driverService.getProfile();
        } catch (error: any) {
             // If 404, it just means no profile exists yet, which is fine
            if (error.response?.status === 404) {
                return null;
            }
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch driver profile');
        }
    }
);

export const createDriverProfile = createAsyncThunk(
    'driver/createProfile',
    async (profileData: { vehicleType: string; licensePlate: string }, { rejectWithValue }) => {
        try {
            return await driverService.createProfile(profileData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create driver profile');
        }
    }
);

export const toggleDriverStatus = createAsyncThunk(
    'driver/toggleStatus',
    async (status: DriverStatus, { rejectWithValue }) => {
        try {
            return await driverService.updateDriverStatus(status);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const driverSlice = createSlice({
    name: 'driver',
    initialState,
    reducers: {
        clearDriverError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addCase(fetchDriverProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDriverProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchDriverProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Profile
            .addCase(createDriverProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            })
            // Toggle Status
            .addCase(toggleDriverStatus.fulfilled, (state, action) => {
                if (state.profile) {
                    state.profile.status = action.payload.status;
                }
            });
    },
});

export const { clearDriverError } = driverSlice.actions;
export default driverSlice.reducer;
