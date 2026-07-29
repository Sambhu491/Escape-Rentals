import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getMyNotifications,
  markNotificationRead as markNotificationReadApi,
  markAllNotificationsRead as markAllNotificationsReadApi,
  deleteNotification as deleteNotificationApi,
  deleteAllNotifications as deleteAllNotificationsApi,
} from "../../api/notificationApi";

// Aligned with Spring Boot 'NotificationType' enum
export const NOTIFICATION_TYPE = {
  BOOKING: "BOOKING",
  PAYMENT: "PAYMENT",
  REVIEW: "REVIEW",
  REVIEW_REPLY: "REVIEW_REPLY",
  REVIEW_CONCERN: "REVIEW_CONCERN",
  REPORT: "REPORT",
  USER_REPORT: "USER_REPORT",
  COMMENT_REPLY: "COMMENT_REPLY",
  CONTACT: "CONTACT",
};

const createPagination = () => ({
  page: 0,
  size: 20,
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

// This is deliberately the minimal scaffold requested: list + mark-read only.
// Removing a notification, and any richer real-time delivery, is intentionally
// left for later — see NotificationsSection.jsx.

export const fetchMyNotifications = createAsyncThunk(
  "notification/fetchMine",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getMyNotifications(params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid notifications response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notification/markRead",
  async (id, thunkAPI) => {
    try {
      const response = await markNotificationReadApi(id);
      if (!response) {
        return thunkAPI.rejectWithValue("Failed to mark notification as read");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Clears the navbar's unread red-dot in one call — dispatched when the
// notifications page mounts, matching Instagram/Facebook/Airbnb's pattern of
// "seen" clearing on open rather than requiring each item to be tapped.
export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllRead",
  async (_, thunkAPI) => {
    try {
      await markAllNotificationsReadApi();
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (id, thunkAPI) => {
    try {
      await deleteNotificationApi(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteAllNotifications = createAsyncThunk(
  "notification/deleteAll",
  async (_, thunkAPI) => {
    try {
      await deleteAllNotificationsApi();
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);




const initialState = {
  notifications: [],
  pagination: createPagination(),
  fetchStatus: "idle",
  markReadStatus: "idle",
  deleteStatus: "idle",
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotificationErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyNotifications.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMyNotifications.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.notifications = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchMyNotifications.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(markNotificationRead.pending, (state) => {
        state.markReadStatus = "loading";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.markReadStatus = "succeeded";
        const updated = action.payload;
        const idx = state.notifications.findIndex((n) => n.id === updated.id);
        if (idx !== -1) state.notifications[idx] = updated;
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.markReadStatus = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.read = true;
        });
      })

 .addCase(deleteNotification.pending, (state) => {
  state.deleteStatus = "loading";
})
.addCase(deleteNotification.fulfilled, (state, action) => {
  state.deleteStatus = "succeeded";

  state.notifications = state.notifications.filter(
    (n) => n.id !== action.payload,
  );

  state.pagination.totalElements = Math.max(
    0,
    state.pagination.totalElements - 1,
  );
})
.addCase(deleteNotification.rejected, (state, action) => {
  state.deleteStatus = "failed";
  state.error = action.payload || action.error.message;
})


.addCase(deleteAllNotifications.pending, (state) => {
  state.deleteStatus = "loading";
})
.addCase(deleteAllNotifications.fulfilled, (state) => {
  state.deleteStatus = "succeeded";
  state.notifications = [];
  state.pagination = createPagination();
})
.addCase(deleteAllNotifications.rejected, (state, action) => {
  state.deleteStatus = "failed";
  state.error = action.payload || action.error.message;
});


  },
})


export const { clearNotificationErrors } = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.notifications;
export const selectNotificationsPagination = (state) => state.notification.pagination;
export const selectNotificationFetchStatus = (state) => state.notification.fetchStatus;
export const selectUnreadNotificationCount = (state) =>
  state.notification.notifications.filter((n) => !n.read).length;

export const selectNotificationDeleteStatus = (state) =>
  state.notification.deleteStatus;


export default notificationSlice.reducer;
