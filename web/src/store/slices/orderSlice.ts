import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

export enum OrderStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export interface Order {
    id: string;
    customerId: string;
    driverId?: string;
    driverName?: string;
    pickupAddress: string;
    deliveryAddress: string;
    packageDescription: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}

interface OrderState {
    ordersList: Order[];
    availableOrders: Order[];
    driverOrders: Order[]; // Orders assigned to me (as a driver)
    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    ordersList: [],
    availableOrders: [],
    driverOrders: [],
    currentOrder: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            return await orderService.getOrders();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

export const fetchAvailableOrders = createAsyncThunk(
    'orders/fetchAvailableOrders',
    async (_, { rejectWithValue }) => {
        try {
            return await orderService.getAvailableOrders();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch available orders');
        }
    }
);

export const fetchDriverOrders = createAsyncThunk(
    'orders/fetchDriverOrders',
    async (_, { rejectWithValue }) => {
        try {
            return await orderService.getDriverOrders();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch driver orders');
        }
    }
);

export const createOrder = createAsyncThunk(
    'orders/create',
    async (orderData: { pickupAddress: string; deliveryAddress: string; packageDescription: string }, { rejectWithValue }) => {
        try {
            return await orderService.createOrder(orderData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create order');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ id, status }: { id: string; status: OrderStatus }, { rejectWithValue }) => {
        try {
            return await orderService.updateStatus(id, status);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

export const assignDriver = createAsyncThunk(
    'orders/assignDriver',
    async ({ orderId, driverId }: { orderId: string; driverId: string }, { rejectWithValue }) => {
        try {
            return await orderService.assignDriver(orderId, driverId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign driver');
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        clearOrderError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Orders
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.ordersList = action.payload;
            })
            // Fetch Available Orders
            .addCase(fetchAvailableOrders.fulfilled, (state, action) => {
                state.availableOrders = action.payload;
            })
            // Fetch Driver Orders
            .addCase(fetchDriverOrders.fulfilled, (state, action) => {
                state.driverOrders = action.payload;
            })
            // Create
            .addCase(createOrder.fulfilled, (state, action) => {
                state.ordersList.push(action.payload);
            })
            // Update Status
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                // Update in all lists if present
                const updateInList = (list: Order[]) => {
                    const index = list.findIndex(o => o.id === action.payload.id);
                    if (index !== -1) list[index] = action.payload;
                };
                updateInList(state.ordersList);
                updateInList(state.driverOrders);
                updateInList(state.availableOrders);
            })
            // Assign Driver
            .addCase(assignDriver.fulfilled, (state, action) => {
                // Remove from available, add to driver orders (if it's me), update ordersList
                 state.availableOrders = state.availableOrders.filter(o => o.id !== action.payload.id);
                 state.driverOrders.push(action.payload);
            });
    },
});

export const { clearCurrentOrder, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
