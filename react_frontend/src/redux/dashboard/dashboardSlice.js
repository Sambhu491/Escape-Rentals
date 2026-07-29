import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getUserDashboard as getUserDashboardApi,
  getHostDashboard as getHostDashboardApi,
  getAdminDashboard as getAdminDashboardApi,
} from "../../api/dashboardApi"; // Adjust path to match your project

// Helpers

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message;

// Async Thunks

// GET /api/profile/user/dashboard — USER only
// Returns: UserDashboardResponse {
//   totalBookings, upcomingBookings, completedBookings,
//   cancelledBookings, totalSpent
// }
export const fetchUserDashboard = createAsyncThunk(
  "dashboard/fetchUser",
  async (_, thunkAPI) => {
    try {
      const response = await getUserDashboardApi();

      if (!response) {
        return thunkAPI.rejectWithValue("Failed to load user dashboard");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/profile/host/dashboard — HOST only
// Returns: HostDashboardResponse {
//   totalProperties, activeBookings, completedBookings,
//   totalRevenue, averageRating
// }
export const fetchHostDashboard = createAsyncThunk(
  "dashboard/fetchHost",
  async (_, thunkAPI) => {
    try {
      const response = await getHostDashboardApi();

      if (!response) {
        return thunkAPI.rejectWithValue("Failed to load host dashboard");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/admin/dashboard — ADMIN only
// Returns: AdminDashboardResponse {
//   totalUsers, totalHosts, totalAdmins,
//   totalProperties, activeProperties, unavailableProperties,
//   totalBookings, pendingBookings, bookingPaymentPending,
//   confirmedBookings, completedBookings, cancelledBookings, expiredBookings,
//   paymentsReceived, failedPayments, refundedPayments,
//   totalReviews, averageRating,
//   totalRevenue,
//   totalReports, pendingReports
// }
export const fetchAdminDashboard = createAsyncThunk(
  "dashboard/fetchAdmin",
  async (_, thunkAPI) => {
    try {
      const response = await getAdminDashboardApi();

      if (!response) {
        return thunkAPI.rejectWithValue("Failed to load admin dashboard");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Initial State

const initialState = {
  // USER dashboard data
  userDashboard: null,

  // HOST dashboard data
  hostDashboard: null,

  // ADMIN dashboard data
  adminDashboard: null,

  // Granular fetch statuses per dashboard type
  fetchStatus: {
    user: "idle",
    host: "idle",
    admin: "idle",
  },

  // Granular errors per dashboard type
  error: {
    user: null,
    host: null,
    admin: null,
  },
};

// Slice

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    clearUserDashboard: (state) => {
      state.userDashboard = null;
      state.fetchStatus.user = "idle";
      state.error.user = null;
    },

    clearHostDashboard: (state) => {
      state.hostDashboard = null;
      state.fetchStatus.host = "idle";
      state.error.host = null;
    },

    clearAdminDashboard: (state) => {
      state.adminDashboard = null;
      state.fetchStatus.admin = "idle";
      state.error.admin = null;
    },

    clearDashboardErrors: (state) => {
      Object.keys(state.error).forEach((key) => {
        state.error[key] = null;
      });
    },

    resetDashboardState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // FETCH USER DASHBOARD
      .addCase(fetchUserDashboard.pending, (state) => {
        state.fetchStatus.user = "loading";
        state.error.user = null;
      })
      .addCase(fetchUserDashboard.fulfilled, (state, action) => {
        state.fetchStatus.user = "succeeded";
        state.userDashboard = action.payload;
      })
      .addCase(fetchUserDashboard.rejected, (state, action) => {
        state.fetchStatus.user = "failed";
        state.error.user = action.payload || action.error.message;
      })

      // FETCH HOST DASHBOARD
      .addCase(fetchHostDashboard.pending, (state) => {
        state.fetchStatus.host = "loading";
        state.error.host = null;
      })
      .addCase(fetchHostDashboard.fulfilled, (state, action) => {
        state.fetchStatus.host = "succeeded";
        state.hostDashboard = action.payload;
      })
      .addCase(fetchHostDashboard.rejected, (state, action) => {
        state.fetchStatus.host = "failed";
        state.error.host = action.payload || action.error.message;
      })

      // FETCH ADMIN DASHBOARD
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.fetchStatus.admin = "loading";
        state.error.admin = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.fetchStatus.admin = "succeeded";
        state.adminDashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.fetchStatus.admin = "failed";
        state.error.admin = action.payload || action.error.message;
      });
  },
});

// Actions

export const {
  clearUserDashboard,
  clearHostDashboard,
  clearAdminDashboard,
  clearDashboardErrors,
  resetDashboardState,
} = dashboardSlice.actions;

// Selectors

// Dashboard data
export const selectUserDashboard = (state) => state.dashboard.userDashboard;
export const selectHostDashboard = (state) => state.dashboard.hostDashboard;
export const selectAdminDashboard = (state) => state.dashboard.adminDashboard;

// All fetch statuses
export const selectDashboardFetchStatus = (state) =>
  state.dashboard.fetchStatus;

// Individual loading selectors
export const selectIsFetchingUserDashboard = (state) =>
  state.dashboard.fetchStatus.user === "loading";

export const selectIsFetchingHostDashboard = (state) =>
  state.dashboard.fetchStatus.host === "loading";

export const selectIsFetchingAdminDashboard = (state) =>
  state.dashboard.fetchStatus.admin === "loading";

// All errors
export const selectDashboardError = (state) => state.dashboard.error;

// Individual error selectors
export const selectUserDashboardError = (state) =>
  state.dashboard.error.user;

export const selectHostDashboardError = (state) =>
  state.dashboard.error.host;

export const selectAdminDashboardError = (state) =>
  state.dashboard.error.admin;

export default dashboardSlice.reducer;
