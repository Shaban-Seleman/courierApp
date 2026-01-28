import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService, PageResponse } from '../../services/orderService';

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
    photoUrl?: string;
    signatureUrl?: string;
    deliveryFee?: number;
    distanceKm?: number;
    rating?: number;
    feedback?: string;
}

export interface PaginationInfo {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}

const defaultPagination: PaginationInfo = {
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
};

interface OrderState {
    ordersList: Order[];
    ordersPagination: PaginationInfo;

    availableOrders: Order[];
    availablePagination: PaginationInfo;

    driverOrders: Order[];
    driverPagination: PaginationInfo;

    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    ordersList: [],
    ordersPagination: defaultPagination,
    availableOrders: [],
    availablePagination: defaultPagination,
    driverOrders: [],
    driverPagination: defaultPagination,
    currentOrder: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async ({ page, size }: { page: number; size: number } = { page: 0, size: 10 }, { rejectWithValue }) => {
        try {
            return await orderService.getOrders(page, size);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

export const fetchAvailableOrders = createAsyncThunk(
    'orders/fetchAvailableOrders',
    async ({ page, size }: { page: number; size: number } = { page: 0, size: 10 }, { rejectWithValue }) => {
        try {
            return await orderService.getAvailableOrders(page, size);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch available orders');
        }
    }
);

export const fetchDriverOrders = createAsyncThunk(
    'orders/fetchDriverOrders',
    async ({ page, size }: { page: number; size: number } = { page: 0, size: 10 }, { rejectWithValue }) => {
        try {
            return await orderService.getDriverOrders(page, size);
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
                const payload = action.payload as unknown as PageResponse<Order>;
                state.ordersList = payload.content;
                state.ordersPagination = {
                    page: payload.number,
                    size: payload.size,
                    totalPages: payload.totalPages,
                    totalElements: payload.totalElements
                };
            })
            // Fetch Available Orders
            .addCase(fetchAvailableOrders.fulfilled, (state, action) => {
                const payload = action.payload as unknown as PageResponse<Order>;
                state.availableOrders = payload.content;
                state.availablePagination = {
                    page: payload.number,
                    size: payload.size,
                    totalPages: payload.totalPages,
                    totalElements: payload.totalElements
                };
            })
            // Fetch Driver Orders
            .addCase(fetchDriverOrders.fulfilled, (state, action) => {
                const payload = action.payload as unknown as PageResponse<Order>;
                state.driverOrders = payload.content;
                state.driverPagination = {
                    page: payload.number,
                    size: payload.size,
                    totalPages: payload.totalPages,
                    totalElements: payload.totalElements
                };
            })
            // Create
            .addCase(createOrder.fulfilled, (state, action) => {
                // Optimistically add to list? Or re-fetch?
                // Re-fetching is safer for pagination consistency, but we'll push to list if it's the first page
                if (state.ordersPagination.page === 0) {
                    state.ordersList.unshift(action.payload);
                }
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
                 state.availableOrders = state.availableOrders.filter(o => o.id !== action.payload.id);
                 state.driverOrders.unshift(action.payload);
            });
    },
});

export const { clearCurrentOrder, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
