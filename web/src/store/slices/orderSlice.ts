import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { endpoints } from '../../services/api';

export enum OrderStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export interface Location {
    latitude: number;
    longitude: number;
}

export interface Order {
    id: string;
    customerName: string;
    pickupLocation: Location;
    deliveryLocation: Location;
    status: OrderStatus;
    courierId?: string;
    createdAt: string;
    totalAmount: number;
    description?: string;
}

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchOrders = createAsyncThunk(
    'orders/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(endpoints.orders.base);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

export const createOrder = createAsyncThunk(
    'orders/create',
    async (orderData: Partial<Order>, { rejectWithValue }) => {
        try {
            const response = await api.post(endpoints.orders.create, orderData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create order');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ id, status }: { id: string; status: OrderStatus }, { rejectWithValue }) => {
        try {
            const response = await api.put(endpoints.orders.updateStatus(id), { status });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createOrder.fulfilled, (state, action) => {
                state.orders.push(action.payload);
            })
            // Update Status
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            });
    },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;