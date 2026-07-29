import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getBookings,
  getBooking,
  createBooking as createBookingApi,
  updateBooking as updateBookingApi,
  cancelBooking as cancelBookingApi,
  approveBooking as approveBookingApi,
  rejectBooking as rejectBookingApi,
  hostCancelBooking as hostCancelBookingApi,
  adminConfirmPayment as adminConfirmPaymentApi,
  adminRejectPayment as adminRejectPaymentApi,
  getMyBookings,
  getHostBookings,
} from "../../api/bookingApi";


// Aligned with Spring Boot 'BookingStatus' enum values
export const BOOKING_STATUS = {
  BOOKING_PAYMENT_PENDING: "BOOKING_PAYMENT_PENDING",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",        
  HOST_CANCELLED: "HOST_CANCELLED",
  COMPLETED: "COMPLETED",
  GUEST_CANCELLED: "GUEST_CANCELLED",
  EXPIRED: "EXPIRED",            
};
// Helpers
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

const updateBookingInCollections = (state, updatedBooking) => {
  const collectionKeys = ["bookings", "myBookings", "hostBookings"];

  collectionKeys.forEach((key) => {
    const index = state[key].findIndex(
      (booking) => booking.id === updatedBooking.id,
    );

    if (index !== -1) {
      state[key][index] = updatedBooking;
    }
  });

  if (state.selectedBooking?.id === updatedBooking.id) {
    state.selectedBooking = updatedBooking;
  }
};

const updateBookingStatusLocally = (state, bookingId, status) => {
  const collectionKeys = ["bookings", "myBookings", "hostBookings"];

  collectionKeys.forEach((key) => {
    const booking = state[key].find((item) => item.id === bookingId);

    if (booking) {
      booking.status = status;
    }
  });

  if (state.selectedBooking?.id === bookingId) {
    state.selectedBooking.status = status;
    state.selectedBooking.updatedAt = new Date().toISOString();
  }
};


// Admin / All bookings
export const fetchBookings = createAsyncThunk(
  "booking/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getBookings(params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid booking response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Single booking
export const fetchBookingById = createAsyncThunk(
  "booking/fetchById",
  async (id, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue("Booking id required");
      }
      const response = await getBooking(id);
      if (!response) {
        return thunkAPI.rejectWithValue("Booking not found");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Guest bookings
export const fetchMyBookings = createAsyncThunk(
  "booking/fetchMine",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getMyBookings(params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid guest bookings response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Host bookings
export const fetchHostBookings = createAsyncThunk(
  "booking/fetchHost",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getHostBookings(params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid host bookings response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Create booking
export const createBooking = createAsyncThunk(
  "booking/create",
  async (data, thunkAPI) => {
    try {
      const response = await createBookingApi(data);
      if (!response) {
        return thunkAPI.rejectWithValue("Booking creation failed");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Update booking
export const updateBooking = createAsyncThunk(
  "booking/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateBookingApi(id, data);
      if (!response) {
        return thunkAPI.rejectWithValue("Update failed — empty response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
  "booking/cancel",
  async (id, thunkAPI) => {
    try {
      await cancelBookingApi(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Approve booking
export const approveBooking = createAsyncThunk(
  "booking/approve",
async ({ id }, thunkAPI) => {
    try {
        const response = await approveBookingApi(id);
      if (!response) {
        return thunkAPI.rejectWithValue("Approved failed — empty response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Reject booking
export const rejectBooking = createAsyncThunk(
  "booking/reject",
async ({ id }, thunkAPI) => {
    try {
          const response = await rejectBookingApi(id);
      if (!response) {
        return thunkAPI.rejectWithValue("Reject failed — empty response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Host/Admin cancel (booking already past PENDING — payment-pending or confirmed)
export const hostCancelBooking = createAsyncThunk(
  "booking/hostCancel",
  async ({ id }, thunkAPI) => {
    try {
      const response = await hostCancelBookingApi(id);
      if (!response) {
        return thunkAPI.rejectWithValue("Cancel failed — empty response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Admin: manually confirm a payment (booking must be awaiting payment) —
// distinct from approving a booking request; does not skip payment. Admin
// "confirming a booking" itself just dispatches the same approveBooking(...)
// a host uses (below), not a special admin-only bypass.
export const adminConfirmPayment = createAsyncThunk(
  "booking/adminConfirmPayment",
  async ({ id }, thunkAPI) => {
    try {
      const response = await adminConfirmPaymentApi(id);
      if (!response) {
        return thunkAPI.rejectWithValue("Confirm failed — empty response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Admin: reject a payment (booking must be awaiting payment)
export const adminRejectPayment = createAsyncThunk(
  "booking/adminRejectPayment",
  async ({ id }, thunkAPI) => {
    try {
      const response = await adminRejectPaymentApi(id);
      if (!response) {
        return thunkAPI.rejectWithValue("Reject failed — empty response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);


// Initial State
const initialState = {
  bookings: [],
  myBookings: [],
  hostBookings: [],

  selectedBooking: null,

  pagination: createPagination(),
  myBookingsPagination: createPagination(),
  hostBookingsPagination: createPagination(),

  fetchStatus: {
    all: "idle",
    single: "idle",
    mine: "idle",
    host: "idle",
  },

  mutationStatus: {
    create: "idle",
    update: "idle",
    cancel: "idle",
    approve: "idle",
    reject: "idle",
    hostCancel: "idle",
    adminConfirmPayment: "idle",
    adminRejectPayment: "idle",
  },

  error: null,

  mutationError: {
    create: null,
    update: null,
    cancel: null,
    approve: null,
    reject: null,
    hostCancel: null,
    adminConfirmPayment: null,
    adminRejectPayment: null,
  },
};


const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearBookingErrors: (state) => {
      state.error = null;
      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },
    resetBookingState: () => ({
      ...initialState,
      pagination: createPagination(),
      myBookingsPagination: createPagination(),
      hostBookingsPagination: createPagination(),
    }),
  },

  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchBookings.pending, (state) => {
        state.fetchStatus.all = "loading";
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.fetchStatus.all = "succeeded";
        state.bookings = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.fetchStatus.all = "failed";
        state.error = action.payload || action.error.message;
      })

      // FETCH SINGLE
      .addCase(fetchBookingById.pending, (state) => {
        state.fetchStatus.single = "loading";
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.fetchStatus.single = "succeeded";
        state.selectedBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.fetchStatus.single = "failed";
        state.selectedBooking = null;
        state.error = action.payload || action.error.message;
      })

      // FETCH MY BOOKINGS
      .addCase(fetchMyBookings.pending, (state) => {
        state.fetchStatus.mine = "loading";
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.fetchStatus.mine = "succeeded";
        state.myBookings = action.payload.content;
        state.myBookingsPagination = extractPagination(action.payload);
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.fetchStatus.mine = "failed";
        state.error = action.payload || action.error.message;
      })

      // FETCH HOST BOOKINGS
      .addCase(fetchHostBookings.pending, (state) => {
        state.fetchStatus.host = "loading";
        state.error = null;
      })
      .addCase(fetchHostBookings.fulfilled, (state, action) => {
        state.fetchStatus.host = "succeeded";
        state.hostBookings = action.payload.content;
        state.hostBookingsPagination = extractPagination(action.payload);
      })
      .addCase(fetchHostBookings.rejected, (state, action) => {
        state.fetchStatus.host = "failed";
        state.error = action.payload || action.error.message;
      })

      // CREATE BOOKING
      .addCase(createBooking.pending, (state) => {
        state.mutationStatus.create = "loading";
        state.mutationError.create = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.mutationStatus.create = "succeeded";
        state.myBookings.unshift(action.payload);
        state.bookings.unshift(action.payload);
        state.pagination.totalElements += 1; 
         state.myBookingsPagination.totalElements += 1; 
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.mutationStatus.create = "failed";
        state.mutationError.create = action.payload || action.error.message;
      })

      // UPDATE BOOKING
      .addCase(updateBooking.pending, (state) => {
        state.mutationStatus.update = "loading";
        state.mutationError.update = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.mutationStatus.update = "succeeded";
        updateBookingInCollections(state, action.payload);
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.mutationStatus.update = "failed";
        state.mutationError.update = action.payload || action.error.message;
      })

      // CANCEL BOOKING
      .addCase(cancelBooking.pending, (state) => {
        state.mutationStatus.cancel = "loading";
        state.mutationError.cancel = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.mutationStatus.cancel = "succeeded";
        updateBookingStatusLocally(
          state,
          action.payload,
          BOOKING_STATUS.GUEST_CANCELLED,
        );
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.mutationStatus.cancel = "failed";
        state.mutationError.cancel = action.payload || action.error.message;
      })

      // APPROVE BOOKING
      .addCase(approveBooking.pending, (state) => {
        state.mutationStatus.approve = "loading";
        state.mutationError.approve = null;
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
  state.mutationStatus.approve = "succeeded";
  // Backend ALWAYS returns BookingResponse, so just use it:
  updateBookingInCollections(state, action.payload);
})
      .addCase(approveBooking.rejected, (state, action) => {
        state.mutationStatus.approve = "failed";
        state.mutationError.approve = action.payload || action.error.message;
      })

      // REJECT BOOKING
      .addCase(rejectBooking.pending, (state) => {
        state.mutationStatus.reject = "loading";
        state.mutationError.reject = null;
      })
.addCase(rejectBooking.fulfilled, (state, action) => {
  state.mutationStatus.reject = "succeeded";
  updateBookingInCollections(state, action.payload);
})
      .addCase(rejectBooking.rejected, (state, action) => {
        state.mutationStatus.reject = "failed";
        state.mutationError.reject = action.payload || action.error.message;
      })

      // HOST/ADMIN CANCEL (paid/confirmed bookings)
      .addCase(hostCancelBooking.pending, (state) => {
        state.mutationStatus.hostCancel = "loading";
        state.mutationError.hostCancel = null;
      })
      .addCase(hostCancelBooking.fulfilled, (state, action) => {
        state.mutationStatus.hostCancel = "succeeded";
        updateBookingInCollections(state, action.payload);
      })
      .addCase(hostCancelBooking.rejected, (state, action) => {
        state.mutationStatus.hostCancel = "failed";
        state.mutationError.hostCancel = action.payload || action.error.message;
      })

      // ADMIN: CONFIRM PAYMENT
      .addCase(adminConfirmPayment.pending, (state) => {
        state.mutationStatus.adminConfirmPayment = "loading";
        state.mutationError.adminConfirmPayment = null;
      })
      .addCase(adminConfirmPayment.fulfilled, (state, action) => {
        state.mutationStatus.adminConfirmPayment = "succeeded";
        updateBookingInCollections(state, action.payload);
      })
      .addCase(adminConfirmPayment.rejected, (state, action) => {
        state.mutationStatus.adminConfirmPayment = "failed";
        state.mutationError.adminConfirmPayment = action.payload || action.error.message;
      })

      // ADMIN: REJECT PAYMENT
      .addCase(adminRejectPayment.pending, (state) => {
        state.mutationStatus.adminRejectPayment = "loading";
        state.mutationError.adminRejectPayment = null;
      })
      .addCase(adminRejectPayment.fulfilled, (state, action) => {
        state.mutationStatus.adminRejectPayment = "succeeded";
        updateBookingInCollections(state, action.payload);
      })
      .addCase(adminRejectPayment.rejected, (state, action) => {
        state.mutationStatus.adminRejectPayment = "failed";
        state.mutationError.adminRejectPayment = action.payload || action.error.message;
      });
  },
});

export const { clearSelectedBooking, clearBookingErrors, resetBookingState } =
  bookingSlice.actions;


// Collections
export const selectAllBookings = (state) => state.booking.bookings;
export const selectMyBookings = (state) => state.booking.myBookings;
export const selectHostBookings = (state) => state.booking.hostBookings;

// Single booking
export const selectSelectedBooking = (state) => state.booking.selectedBooking;

// Fetch states
export const selectBookingFetchStatus = (state) => state.booking.fetchStatus;
export const selectIsFetchingAllBookings = (state) =>
  state.booking.fetchStatus.all === "loading";
export const selectIsFetchingSingleBooking = (state) =>
  state.booking.fetchStatus.single === "loading";
export const selectIsFetchingMyBookings = (state) =>
  state.booking.fetchStatus.mine === "loading";
export const selectIsFetchingHostBookings = (state) =>
  state.booking.fetchStatus.host === "loading";

// Mutation states
export const selectBookingMutationStatus = (state) =>
  state.booking.mutationStatus;
export const selectBookingMutationError = (state) =>
  state.booking.mutationError;

// Individual mutation loading selectors
export const selectIsCreatingBooking = (state) =>
  state.booking.mutationStatus.create === "loading";
export const selectIsUpdatingBooking = (state) =>
  state.booking.mutationStatus.update === "loading";
export const selectIsCancellingBooking = (state) =>
  state.booking.mutationStatus.cancel === "loading";
export const selectIsApprovingBooking = (state) =>
  state.booking.mutationStatus.approve === "loading";
export const selectIsRejectingBooking = (state) =>
  state.booking.mutationStatus.reject === "loading";
export const selectIsHostCancellingBooking = (state) =>
  state.booking.mutationStatus.hostCancel === "loading";
export const selectIsAdminConfirmingPayment = (state) =>
  state.booking.mutationStatus.adminConfirmPayment === "loading";
export const selectIsAdminRejectingPayment = (state) =>
  state.booking.mutationStatus.adminRejectPayment === "loading";

// Errors
export const selectBookingError = (state) => state.booking.error;

// Pagination
export const selectBookingPagination = (state) => state.booking.pagination;
export const selectMyBookingsPagination = (state) =>
  state.booking.myBookingsPagination;
export const selectHostBookingsPagination = (state) =>
  state.booking.hostBookingsPagination;

export default bookingSlice.reducer;
