import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  verifyOtp as verifyOtpApi,
  resendOtp as resendOtpApi,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
} from "../../api/otpApi"; // Adjust path to match your project


// Constants


// Aligned with Spring Boot 'OtpPurpose' enum
export const OTP_PURPOSE = {
  REGISTRATION: "REGISTRATION",
  PASSWORD_RESET: "PASSWORD_RESET",
};


// Helpers


const getErrorMessage = (error) =>
  error.response?.data?.message || error.message;


// Async Thunks


// POST /auth/verify-otp
// Request:  { email, otpCode }
// Response: AuthResponse { token, id, firstName, lastName, email, phone, role }
export const verifyOtp = createAsyncThunk(
  "otp/verifyOtp",
  async (data, thunkAPI) => {
    try {
      const response = await verifyOtpApi(data);

      if (!response?.token) {
        return thunkAPI.rejectWithValue("OTP verification failed");
      }

      // Persist token to localStorage for axiosInstance interceptor
      localStorage.setItem("token", response.token);

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /auth/resend-otp
// Request:  { email, purpose: OTP_PURPOSE.REGISTRATION | OTP_PURPOSE.PASSWORD_RESET }
// Response: OtpResponse { success, message }
export const resendOtp = createAsyncThunk(
  "otp/resendOtp",
  async (data, thunkAPI) => {
    try {
      const response = await resendOtpApi(data);

      if (!response?.success) {
        return thunkAPI.rejectWithValue("Failed to resend OTP");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /auth/forgot-password
// Request:  { email }
// Response: OtpResponse { success, message }
export const forgotPassword = createAsyncThunk(
  "otp/forgotPassword",
  async (data, thunkAPI) => {
    try {
      const response = await forgotPasswordApi(data);

      if (!response?.success) {
        return thunkAPI.rejectWithValue("Failed to initiate password reset");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /auth/reset-password
// Request:  { email, otpCode, newPassword }
// Response: OtpResponse { success, message }
export const resetPassword = createAsyncThunk(
  "otp/resetPassword",
  async (data, thunkAPI) => {
    try {
      const response = await resetPasswordApi(data);

      if (!response?.success) {
        return thunkAPI.rejectWithValue("Failed to reset password");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);


// Initial State


const initialState = {
  // Stored after verifyOtp — full AuthResponse from backend
  // { token, id, firstName, lastName, email, phone, role }
  // NOTE: Also dispatch your authSlice action in the component to keep
  // auth state in sync after successful OTP verification (login via OTP)
  authData: null,

  // Success messages from OtpResponse { success, message }
  successMessage: null,

  passwordResetEmail: null,

  // Granular status per OTP action
  status: {
    verifyOtp: "idle",
    resendOtp: "idle",
    forgotPassword: "idle",
    resetPassword: "idle",
  },

  // Granular errors per OTP action
  error: {
    verifyOtp: null,
    resendOtp: null,
    forgotPassword: null,
    resetPassword: null,
  },
};


// Slice


const otpSlice = createSlice({
  name: "otp",

  initialState,

  reducers: {
    clearOtpState: () => initialState,

    clearOtpErrors: (state) => {
      Object.keys(state.error).forEach((key) => {
        state.error[key] = null;
      });
    },

    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },

    clearAuthData: (state) => {
      state.authData = null;
    },

    resetOtpState:(state)=>{
    Object.keys(state.status).forEach((key) => {
        state.status[key]="idle";
      });
    Object.keys(state.error).forEach((key) => {
        state.error[key] = null;
      });
    state.successMessage=null;
},


  },

  extraReducers: (builder) => {
    builder

      
      // VERIFY OTP
      
      .addCase(verifyOtp.pending, (state) => {
        state.status.verifyOtp = "loading";
        state.error.verifyOtp = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status.verifyOtp = "succeeded";
        // Store full AuthResponse — use selectOtpAuthData to read this
        // in your component and also update your authSlice accordingly
        state.authData = action.payload;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status.verifyOtp = "failed";
        state.error.verifyOtp = action.payload || action.error.message;
      })

      
      // RESEND OTP
      
      .addCase(resendOtp.pending, (state) => {
        state.status.resendOtp = "loading";
        state.error.resendOtp = null;
        state.successMessage = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.status.resendOtp = "succeeded";
        state.successMessage = action.payload.message;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.status.resendOtp = "failed";
        state.error.resendOtp = action.payload || action.error.message;
      })

      
      // FORGOT PASSWORD
      
      .addCase(forgotPassword.pending, (state) => {
        state.status.forgotPassword = "loading";
        state.error.forgotPassword = null;
        state.successMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status.forgotPassword = "succeeded";
        state.successMessage = action.payload.message;
        state.passwordResetEmail = action.meta.arg.email;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status.forgotPassword = "failed";
        state.error.forgotPassword = action.payload || action.error.message;
      })

      
      // RESET PASSWORD
      
      .addCase(resetPassword.pending, (state) => {
        state.status.resetPassword = "loading";
        state.error.resetPassword = null;
        state.successMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status.resetPassword = "succeeded";
        state.successMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status.resetPassword = "failed";
        state.error.resetPassword = action.payload || action.error.message;
      });
  },
});


// Actions


export const {
  clearOtpState,
  clearOtpErrors,
  clearSuccessMessage,
  clearAuthData,
  resetOtpState,
} = otpSlice.actions;


// Selectors


// Auth data returned after verifyOtp (AuthResponse)
export const selectOtpAuthData = (state) => state.otp.authData;

// Success message (from OtpResponse)
export const selectOtpSuccessMessage = (state) => state.otp.successMessage;

// All statuses
export const selectOtpStatus = (state) => state.otp.status;

// All errors
export const selectOtpError = (state) => state.otp.error;

// Individual loading selectors
export const selectIsVerifyingOtp = (state) =>
  state.otp.status.verifyOtp === "loading";

export const selectIsResendingOtp = (state) =>
  state.otp.status.resendOtp === "loading";

export const selectIsSendingForgotPassword = (state) =>
  state.otp.status.forgotPassword === "loading";

export const selectIsResettingPassword = (state) =>
  state.otp.status.resetPassword === "loading";

// Individual succeeded selectors — useful for navigating after success
export const selectVerifyOtpSucceeded = (state) =>
  state.otp.status.verifyOtp === "succeeded";

export const selectForgotPasswordSucceeded = (state) =>
  state.otp.status.forgotPassword === "succeeded";

export const selectResetPasswordSucceeded = (state) =>
  state.otp.status.resetPassword === "succeeded";

export const selectPasswordResetEmail = (state) =>
  state.otp.passwordResetEmail;


// Individual error selectors
export const selectVerifyOtpError = (state) => state.otp.error.verifyOtp;
export const selectResendOtpError = (state) => state.otp.error.resendOtp;
export const selectForgotPasswordError = (state) =>
  state.otp.error.forgotPassword;
export const selectResetPasswordError = (state) =>
  state.otp.error.resetPassword;

export default otpSlice.reducer;
