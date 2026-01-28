import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  defaultLatitude?: number;
  defaultLongitude?: number;
  defaultCity?: string;
  theme?: 'LIGHT' | 'DARK';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Check local storage for existing session
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: { username: string; password: string; email: string; role: string }, { rejectWithValue }) => {
        try {
            return await authService.register(userData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        await authService.logout();
        dispatch(authSlice.actions.logout());
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async ({ userId, data }: { userId: string; data: Partial<User> }, { rejectWithValue }) => {
        try {
            return await authService.updateProfile(userId, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Profile update failed');
        }
    }
);

export const changeUserPassword = createAsyncThunk(
    'auth/changePassword',
    async ({ userId, data }: { userId: string; data: any }, { rejectWithValue }) => {
        try {
            await authService.changePassword(userId, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Password change failed');
        }
    }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
          state.loading = true;
          state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
          state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
          if (state.user) {
              state.user = { ...state.user, ...action.payload };
              localStorage.setItem('user', JSON.stringify(state.user));
          }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;