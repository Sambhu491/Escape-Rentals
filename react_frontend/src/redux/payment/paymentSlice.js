import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createOrder as createOrderApi,
  verifyPayment as verifyPaymentApi,
  getPayment,
  getPayments,
} from "../../api/paymentApi"; 

// Constants

// Aligned with Spring Boot 'PaymentStatus' enum
export const PAYMENT_STATUS = {
  CREATED: "CREATED",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
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

// Async Thunks

// POST /api/payments/order/{bookingId}
// Returns: CreateOrderResponse { orderId, amount, currency, key }
// Use the returned data to launch Razorpay checkout in your component
export const createOrder = createAsyncThunk(
  "payment/createOrder",
  async (bookingId, thunkAPI) => {
    try {
      if (!bookingId) {
        return thunkAPI.rejectWithValue("Booking id required");
      }

      const response = await createOrderApi(bookingId);

      if (!response?.orderId) {
        return thunkAPI.rejectWithValue("Failed to create payment order");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /api/payments/verify
// Returns: 200 OK empty body — Razorpay signature verified, booking set to CONFIRMED
// data: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async (data, thunkAPI) => {
    try {
      await verifyPaymentApi(data);

      // Backend returns Void — return the orderId so we can match in state
      return { razorpayOrderId: data.razorpayOrderId };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/payments/{bookingId}
// Returns: PaymentResponse
export const fetchPaymentByBooking = createAsyncThunk(
  "payment/fetchByBooking",
  async (bookingId, thunkAPI) => {
    try {
      if (!bookingId) {
        return thunkAPI.rejectWithValue("Booking id required");
      }

      const response = await getPayment(bookingId);

      if (!response) {
        return thunkAPI.rejectWithValue("Payment not found");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/payments/admin — Admin only, paginated
// params: { page, size, sort }
export const fetchAllPayments = createAsyncThunk(
  "payment/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getPayments(params);

      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid payments response");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Initial State

const initialState = {
  // Admin: paginated list
  payments: [],

  // Booking-scoped payment detail (guest / host / admin)
  currentPayment: null,

  // Razorpay order data — used to launch Razorpay checkout
  // { orderId, amount, currency, key }
  orderData: null,

  // Pagination for admin payments list
  pagination: createPagination(),

  // Fetch statuses
  fetchStatus: {
    all: "idle",      // Admin list
    single: "idle",   // Booking-scoped payment
  },

  // Mutation statuses
  mutationStatus: {
    createOrder: "idle",
    verify: "idle",
  },

  // Errors
  error: null,

  mutationError: {
    createOrder: null,
    verify: null,
  },
};

// Slice

const paymentSlice = createSlice({
  name: "payment",

  initialState,

  reducers: {
    clearOrderData: (state) => {
      state.orderData = null;
    },

    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },

    clearPaymentErrors: (state) => {
      state.error = null;

      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },

    resetPaymentState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // FETCH ALL PAYMENTS (Admin)
      .addCase(fetchAllPayments.pending, (state) => {
        state.fetchStatus.all = "loading";
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.fetchStatus.all = "succeeded";
        state.payments = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.fetchStatus.all = "failed";
        state.error = action.payload || action.error.message;
      })

      // FETCH PAYMENT BY BOOKING
      .addCase(fetchPaymentByBooking.pending, (state) => {
        state.fetchStatus.single = "loading";
        state.error = null;
      })
      .addCase(fetchPaymentByBooking.fulfilled, (state, action) => {
        state.fetchStatus.single = "succeeded";
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentByBooking.rejected, (state, action) => {
        state.fetchStatus.single = "failed";
        state.currentPayment = null;
        state.error = action.payload || action.error.message;
      })

      // CREATE RAZORPAY ORDER
      .addCase(createOrder.pending, (state) => {
        state.mutationStatus.createOrder = "loading";
        state.mutationError.createOrder = null;
        state.orderData = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.mutationStatus.createOrder = "succeeded";
        // Store Razorpay order data — read via selectOrderData to open checkout
        state.orderData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.mutationStatus.createOrder = "failed";
        state.mutationError.createOrder =
          action.payload || action.error.message;
      })

      // VERIFY PAYMENT (Razorpay signature check)
      .addCase(verifyPayment.pending, (state) => {
        state.mutationStatus.verify = "loading";
        state.mutationError.verify = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.mutationStatus.verify = "succeeded";

        // Mark currentPayment as PAID locally (backend returns Void)
        if (state.currentPayment) {
          state.currentPayment.status = PAYMENT_STATUS.PAID;
        }

        // Also sync in admin list if present
        const idx = state.payments.findIndex(
          (p) => p.razorpayOrderId === state.orderData?.orderId,
        );
        if (idx !== -1) {
          state.payments[idx].status = PAYMENT_STATUS.PAID;
        }

        // Clear order data — checkout is complete
        state.orderData = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.mutationStatus.verify = "failed";
        state.mutationError.verify = action.payload || action.error.message;

        // Mark currentPayment as FAILED locally on signature failure
        if (state.currentPayment) {
          state.currentPayment.status = PAYMENT_STATUS.FAILED;
        }
      });
  },
});

// Actions

export const {
  clearOrderData,
  clearCurrentPayment,
  clearPaymentErrors,
  resetPaymentState,
} = paymentSlice.actions;

// Selectors

// Admin list
export const selectAllPayments = (state) => state.payment.payments;

// Booking-scoped payment
export const selectCurrentPayment = (state) => state.payment.currentPayment;

// Razorpay order data — use to open checkout modal
export const selectOrderData = (state) => state.payment.orderData;

// Pagination
export const selectPaymentPagination = (state) => state.payment.pagination;

// Fetch statuses
export const selectPaymentFetchStatus = (state) => state.payment.fetchStatus;

export const selectIsFetchingAllPayments = (state) =>
  state.payment.fetchStatus.all === "loading";

export const selectIsFetchingCurrentPayment = (state) =>
  state.payment.fetchStatus.single === "loading";

// Mutation statuses
export const selectPaymentMutationStatus = (state) =>
  state.payment.mutationStatus;

export const selectPaymentMutationError = (state) =>
  state.payment.mutationError;

// Individual mutation loading selectors
export const selectIsCreatingOrder = (state) =>
  state.payment.mutationStatus.createOrder === "loading";

export const selectIsVerifyingPayment = (state) =>
  state.payment.mutationStatus.verify === "loading";

// Succeeded selectors — for post-payment navigation
export const selectCreateOrderSucceeded = (state) =>
  state.payment.mutationStatus.createOrder === "succeeded";

export const selectVerifyPaymentSucceeded = (state) =>
  state.payment.mutationStatus.verify === "succeeded";

// Errors
export const selectPaymentError = (state) => state.payment.error;
export const selectCreateOrderError = (state) =>
  state.payment.mutationError.createOrder;
export const selectVerifyPaymentError = (state) =>
  state.payment.mutationError.verify;

export default paymentSlice.reducer;
