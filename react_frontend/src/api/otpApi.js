import axiosInstance from "./axiosInstance";

// POST /auth/verify-otp
// Returns AuthResponse { token, id, firstName, lastName, email, phone, role }
export const verifyOtp = (data) =>
  axiosInstance.post("/auth/verify-otp", data);

// POST /auth/resend-otp
// Returns OtpResponse { success, message }
// data: { email, purpose: "REGISTRATION" | "PASSWORD_RESET" }
export const resendOtp = (data) =>
  axiosInstance.post("/auth/resend-otp", data);

// POST /auth/forgot-password
// Returns OtpResponse { success, message }
// data: { email }
export const forgotPassword = (data) =>
  axiosInstance.post("/auth/forgot-password", data);

// POST /auth/reset-password
// Returns OtpResponse { success, message }
// data: { email, otpCode, newPassword }
export const resetPassword = (data) =>
  axiosInstance.post("/auth/reset-password", data);
