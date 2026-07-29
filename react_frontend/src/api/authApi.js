import axiosInstance from "./axiosInstance";

// OTP-related endpoints (verify/resend/forgot/reset) live in otpApi.js —
// otpSlice imports from there, so they were removed from here as dead duplicates.

export const registerUser = (data) =>
    axiosInstance.post("/auth/register", data);

export const loginUser = (data) =>
    axiosInstance.post("/auth/login", data);