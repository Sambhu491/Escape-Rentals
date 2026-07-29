import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getReports,
  getReport,
  getMyReports,
  createReport as createReportApi,
  updateReportStatus as updateReportStatusApi,
} from "../../api/reportApi"; // Adjust path to match your project

// ==============================
// Constants
// ==============================

// Aligned with Spring Boot 'ReportStatus' enum
export const REPORT_STATUS = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

// Aligned with Spring Boot 'ReportType' enum
export const REPORT_TYPE = {
  WRONG_INFORMATION: "WRONG_INFORMATION",
  WRONG_IMAGES: "WRONG_IMAGES",
  WRONG_ADDRESS: "WRONG_ADDRESS",
  MISLEADING_PRICING: "MISLEADING_PRICING",
  INAPPROPRIATE_CONTENT: "INAPPROPRIATE_CONTENT",
  SAFETY_CONCERN: "SAFETY_CONCERN",
  FRAUD: "FRAUD",
  OTHER: "OTHER",
};

// ==============================
// Helpers
// ==============================

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

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message;

// ==============================
// Async Thunks
// ==============================

// GET /api/reports — Admin: filtered + paginated list
export const fetchReports = createAsyncThunk(
  "report/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getReports(params);

      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid reports response");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/reports/{id} — Admin: single report
export const fetchReportById = createAsyncThunk(
  "report/fetchById",
  async (id, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue("Report id required");
      }

      const response = await getReport(id);

      if (!response) {
        return thunkAPI.rejectWithValue("Report not found");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/reports/my — Reporter: own submissions, paginated
export const fetchMyReports = createAsyncThunk(
  "report/fetchMine",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getMyReports(params);

      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid my reports response");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /api/reports — USER or HOST creates a report
// data: { propertyId, type: REPORT_TYPE.*, description }
export const createReport = createAsyncThunk(
  "report/create",
  async (data, thunkAPI) => {
    try {
      const response = await createReportApi(data);

      if (!response) {
        return thunkAPI.rejectWithValue("Failed to create report");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PATCH /api/reports/{id}/status — Admin: update report status + optional note
// data: { status: REPORT_STATUS.*, adminNote?: string }
export const updateReportStatus = createAsyncThunk(
  "report/updateStatus",
  async ({ id, data }, thunkAPI) => {
    try {
      return await updateReportStatusApi(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// ==============================
// Initial State
// ==============================

const initialState = {
  // Admin: filtered list
  reports: [],

  // Reporter: own submissions
  myReports: [],

  // Admin: single report detail
  selectedReport: null,

  // Pagination
  pagination: createPagination(),
  myReportsPagination: createPagination(),

  // Fetch statuses
  fetchStatus: {
    all: "idle",
    single: "idle",
    mine: "idle",
  },

  // Mutation statuses
  mutationStatus: {
    create: "idle",
    updateStatus: "idle",
  },

  // Errors
  error: null,

  mutationError: {
    create: null,
    updateStatus: null,
  },
};

// ==============================
// Slice
// ==============================

const reportSlice = createSlice({
  name: "report",

  initialState,

  reducers: {
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },

    clearReportErrors: (state) => {
      state.error = null;

      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },

    resetReportState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // =====================================
      // FETCH ALL REPORTS (Admin)
      // =====================================
      .addCase(fetchReports.pending, (state) => {
        state.fetchStatus.all = "loading";
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.fetchStatus.all = "succeeded";
        state.reports = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.fetchStatus.all = "failed";
        state.error = action.payload || action.error.message;
      })

      // =====================================
      // FETCH SINGLE REPORT (Admin)
      // =====================================
      .addCase(fetchReportById.pending, (state) => {
        state.fetchStatus.single = "loading";
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.fetchStatus.single = "succeeded";
        state.selectedReport = action.payload;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.fetchStatus.single = "failed";
        state.selectedReport = null;
        state.error = action.payload || action.error.message;
      })

      // =====================================
      // FETCH MY REPORTS (Reporter)
      // =====================================
      .addCase(fetchMyReports.pending, (state) => {
        state.fetchStatus.mine = "loading";
        state.error = null;
      })
      .addCase(fetchMyReports.fulfilled, (state, action) => {
        state.fetchStatus.mine = "succeeded";
        state.myReports = action.payload.content;
        state.myReportsPagination = extractPagination(action.payload);
      })
      .addCase(fetchMyReports.rejected, (state, action) => {
        state.fetchStatus.mine = "failed";
        state.error = action.payload || action.error.message;
      })

      // =====================================
      // CREATE REPORT (USER / HOST)
      // =====================================
      .addCase(createReport.pending, (state) => {
        state.mutationStatus.create = "loading";
        state.mutationError.create = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.mutationStatus.create = "succeeded";
        // Prepend to reporter's own list
        state.myReports.unshift(action.payload);
        // Also prepend to admin list if loaded
        state.reports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.mutationStatus.create = "failed";
        state.mutationError.create = action.payload || action.error.message;
      })

      // =====================================
      // UPDATE REPORT STATUS (Admin)
      // =====================================
      .addCase(updateReportStatus.pending, (state) => {
        state.mutationStatus.updateStatus = "loading";
        state.mutationError.updateStatus = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.mutationStatus.updateStatus = "succeeded";
        const updated = action.payload;

        // Sync admin reports list
        const idx = state.reports.findIndex((r) => r.id === updated.id);
        if (idx !== -1) {
          state.reports[idx] = updated;
        }

        // Sync reporter's own list if present
        const myIdx = state.myReports.findIndex((r) => r.id === updated.id);
        if (myIdx !== -1) {
          state.myReports[myIdx] = updated;
        }

        // Sync selected report if open
        if (state.selectedReport?.id === updated.id) {
          state.selectedReport = updated;
        }
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.mutationStatus.updateStatus = "failed";
        state.mutationError.updateStatus =
          action.payload || action.error.message;
      });
  },
});

// ==============================
// Actions
// ==============================

export const { clearSelectedReport, clearReportErrors, resetReportState } =
  reportSlice.actions;

// ==============================
// Selectors
// ==============================

// Collections
export const selectAllReports = (state) => state.report.reports;
export const selectMyReports = (state) => state.report.myReports;
export const selectSelectedReport = (state) => state.report.selectedReport;

// Pagination
export const selectReportPagination = (state) => state.report.pagination;
export const selectMyReportsPagination = (state) =>
  state.report.myReportsPagination;

// Fetch statuses
export const selectReportFetchStatus = (state) => state.report.fetchStatus;

export const selectIsFetchingReports = (state) =>
  state.report.fetchStatus.all === "loading";

export const selectIsFetchingSingleReport = (state) =>
  state.report.fetchStatus.single === "loading";

export const selectIsFetchingMyReports = (state) =>
  state.report.fetchStatus.mine === "loading";

// Mutation statuses
export const selectReportMutationStatus = (state) =>
  state.report.mutationStatus;

export const selectReportMutationError = (state) =>
  state.report.mutationError;

// Individual mutation loading selectors
export const selectIsCreatingReport = (state) =>
  state.report.mutationStatus.create === "loading";

export const selectIsUpdatingReportStatus = (state) =>
  state.report.mutationStatus.updateStatus === "loading";

// Succeeded selectors — for post-action navigation
export const selectCreateReportSucceeded = (state) =>
  state.report.mutationStatus.create === "succeeded";

export const selectUpdateReportStatusSucceeded = (state) =>
  state.report.mutationStatus.updateStatus === "succeeded";

// Errors
export const selectReportError = (state) => state.report.error;
export const selectCreateReportError = (state) =>
  state.report.mutationError.create;
export const selectUpdateReportStatusError = (state) =>
  state.report.mutationError.updateStatus;

export default reportSlice.reducer;
