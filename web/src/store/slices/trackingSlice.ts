import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DriverLocation {
    driverId: string;
    latitude: number;
    longitude: number;
    timestamp: number;
}

interface TrackingState {
    activeDrivers: Record<string, DriverLocation>;
    isConnected: boolean;
}

const initialState: TrackingState = {
    activeDrivers: {},
    isConnected: false,
};

const trackingSlice = createSlice({
    name: 'tracking',
    initialState,
    reducers: {
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        updateDriverLocation: (state, action: PayloadAction<DriverLocation>) => {
            state.activeDrivers[action.payload.driverId] = action.payload;
        },
        removeDriver: (state, action: PayloadAction<string>) => {
            delete state.activeDrivers[action.payload];
        }
    },
});

export const { setConnectionStatus, updateDriverLocation, removeDriver } = trackingSlice.actions;
export default trackingSlice.reducer;
