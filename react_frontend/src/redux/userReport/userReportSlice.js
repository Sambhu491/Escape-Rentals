import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getUserReports,
  getUserReport,
  getReportsForUser,
  getMyUserReports,
  createUserReport as createUserReportApi,
  updateUserReportStatus as updateUserReportStatusApi,
} from "../../api/userReportApi";

// Aligned with Spring Boot 'ReportStatus' enum (reused as-is by the backend
// userreport domain — see UserReportEntity)
export const USER_REPORT_STATUS = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

// Aligned with Spring Boot 'UserReportType' enum
export const USER_REPORT_TYPE = {
  FRAUD: "FRAUD",
  HARASSMENT: "HARASSMENT",
  ABUSIVE_BEHAVIOR: "ABUSIVE_BEHAVIOR",
  MISLEADING_INFORMATION: "MISLEADING_INFORMATION",
  PAYMENT_DISPUTE: "PAYMENT_DISPUTE",
  SAFETY_CONCERN: "SAFETY_CONCERN",
  OTHER: "OTHER",
};

const createPagination = () => ({
  page: 0,
  size: 10,
  totalPages: 0,
  totalElements: 0,
});

const extractPagination = (response) => ({
  page: response.number,
  size: response.size,
  totalPages: response.totalPages,
  totalElements: response.totalElements,
});

const getErrorMessage = (error) => error.response?.data?.message || error.message;

// GET /api/user-reports — Admin: filtered + paginated list
export const fetchUserReports = createAsyncThunk(
  "userReport/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getUserReports(params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid user reports response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/user-reports/{id} — Admin: single report
export const fetchUserReportById = createAsyncThunk(
  "userReport/fetchById",
  async (id, thunkAPI) => {
    try {
      if (!id) return thunkAPI.rejectWithValue("Report id required");
      const response = await getUserReport(id);
      if (!response) return thunkAPI.rejectWithValue("Report not found");
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/user-reports/user/{userId} — Admin: reports filed against one user
export const fetchReportsForUser = createAsyncThunk(
  "userReport/fetchForUser",
  async ({ userId, params = {} }, thunkAPI) => {
    try {
      const response = await getReportsForUser(userId, params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/user-reports/my — Reporter's own submissions
export const fetchMyUserReports = createAsyncThunk(
  "userReport/fetchMine",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getMyUserReports(params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid my user reports response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /api/user-reports — USER or HOST reports another user
// data: { reportedUserId, type: USER_REPORT_TYPE.*, description }
export const createUserReport = createAsyncThunk(
  "userReport/create",
  async (data, thunkAPI) => {
    try {
      const response = await createUserReportApi(data);
      if (!response) return thunkAPI.rejectWithValue("Failed to create report");
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PATCH /api/user-reports/{id}/status — Admin: update status + optional note
export const updateUserReportStatus = createAsyncThunk(
  "userReport/updateStatus",
  async ({ id, data }, thunkAPI) => {
    try {
      return await updateUserReportStatusApi(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

const initialState = {
  reports: [],
  myReports: [],
  forUser: [],
  selectedReport: null,

  pagination: createPagination(),
  myReportsPagination: createPagination(),
  forUserPagination: createPagination(),

  fetchStatus: {
    all: "idle",
    single: "idle",
    mine: "idle",
    forUser: "idle",
  },

  mutationStatus: {
    create: "idle",
    updateStatus: "idle",
  },

  error: null,
  mutationError: {
    create: null,
    updateStatus: null,
  },
};

const userReportSlice = createSlice({
  name: "userReport",
  initialState,
  reducers: {
    clearSelectedUserReport: (state) => {
      state.selectedReport = null;
    },
    clearUserReportErrors: (state) => {
      state.error = null;
      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },
    resetUserReportState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserReports.pending, (state) => {
        state.fetchStatus.all = "loading";
        state.error = null;
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.fetchStatus.all = "succeeded";
        state.reports = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchUserReports.rejected, (state, action) => {
        state.fetchStatus.all = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchUserReportById.pending, (state) => {
        state.fetchStatus.single = "loading";
        state.error = null;
      })
      .addCase(fetchUserReportById.fulfilled, (state, action) => {
        state.fetchStatus.single = "succeeded";
        state.selectedReport = action.payload;
      })
      .addCase(fetchUserReportById.rejected, (state, action) => {
        state.fetchStatus.single = "failed";
        state.selectedReport = null;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchReportsForUser.pending, (state) => {
        state.fetchStatus.forUser = "loading";
        state.error = null;
      })
      .addCase(fetchReportsForUser.fulfilled, (state, action) => {
        state.fetchStatus.forUser = "succeeded";
        state.forUser = action.payload.content;
        state.forUserPagination = extractPagination(action.payload);
      })
      .addCase(fetchReportsForUser.rejected, (state, action) => {
        state.fetchStatus.forUser = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchMyUserReports.pending, (state) => {
        state.fetchStatus.mine = "loading";
        state.error = null;
      })
      .addCase(fetchMyUserReports.fulfilled, (state, action) => {
        state.fetchStatus.mine = "succeeded";
        state.myReports = action.payload.content;
        state.myReportsPagination = extractPagination(action.payload);
      })
      .addCase(fetchMyUserReports.rejected, (state, action) => {
        state.fetchStatus.mine = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(createUserReport.pending, (state) => {
        state.mutationStatus.create = "loading";
        state.mutationError.create = null;
      })
      .addCase(createUserReport.fulfilled, (state, action) => {
        state.mutationStatus.create = "succeeded";
        state.myReports.unshift(action.payload);
      })
      .addCase(createUserReport.rejected, (state, action) => {
        state.mutationStatus.create = "failed";
        state.mutationError.create = action.payload || action.error.message;
      })

      .addCase(updateUserReportStatus.pending, (state) => {
        state.mutationStatus.updateStatus = "loading";
        state.mutationError.updateStatus = null;
      })
      .addCase(updateUserReportStatus.fulfilled, (state, action) => {
        state.mutationStatus.updateStatus = "succeeded";
        const updated = action.payload;

        const idx = state.reports.findIndex((r) => r.id === updated.id);
        if (idx !== -1) state.reports[idx] = updated;

        const forUserIdx = state.forUser.findIndex((r) => r.id === updated.id);
        if (forUserIdx !== -1) state.forUser[forUserIdx] = updated;

        if (state.selectedReport?.id === updated.id) {
          state.selectedReport = updated;
        }
      })
      .addCase(updateUserReportStatus.rejected, (state, action) => {
        state.mutationStatus.updateStatus = "failed";
        state.mutationError.updateStatus = action.payload || action.error.message;
      });
  },
});

export const { clearSelectedUserReport, clearUserReportErrors, resetUserReportState } =
  userReportSlice.actions;

export const selectAllUserReports = (state) => state.userReport.reports;
export const selectMyUserReports = (state) => state.userReport.myReports;
export const selectReportsForUser = (state) => state.userReport.forUser;
export const selectSelectedUserReport = (state) => state.userReport.selectedReport;

export const selectUserReportPagination = (state) => state.userReport.pagination;
export const selectReportsForUserPagination = (state) => state.userReport.forUserPagination;

export const selectUserReportFetchStatus = (state) => state.userReport.fetchStatus;

export const selectUserReportMutationStatus = (state) => state.userReport.mutationStatus;
export const selectUserReportMutationError = (state) => state.userReport.mutationError;
export const selectIsCreatingUserReport = (state) =>
  state.userReport.mutationStatus.create === "loading";

export default userReportSlice.reducer;
