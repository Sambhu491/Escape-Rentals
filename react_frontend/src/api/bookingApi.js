import axiosInstance from "./axiosInstance";

// GET ALL BOOKINGS (Admin / Filters)
export const getBookings = (params = {}) => 
  axiosInstance.get("/api/bookings", { params });

// GET BOOKING BY ID
export const getBooking = (id) => 
  axiosInstance.get(`/api/bookings/${id}`);

// CREATE BOOKING
export const createBooking = (data) => 
  axiosInstance.post("/api/bookings", data);

// UPDATE BOOKING
export const updateBooking = (id, data) => 
  axiosInstance.put(`/api/bookings/${id}`, data);

// CANCEL BOOKING (Guest Cancel)
export const cancelBooking = (id) => 
  axiosInstance.patch(`/api/bookings/${id}/cancel`);

// APPROVE BOOKING (Host Approve)
export const approveBooking = (id) => 
  axiosInstance.patch(`/api/bookings/${id}/approve`);

// REJECT BOOKING (Host Reject)
export const rejectBooking = (id) =>
  axiosInstance.patch(`/api/bookings/${id}/reject`);

// HOST/ADMIN CANCEL (booking already past PENDING — payment-pending or confirmed)
export const hostCancelBooking = (id) =>
  axiosInstance.patch(`/api/bookings/${id}/host-cancel`);

// ADMIN: manually confirm a payment (booking must be awaiting payment) —
// distinct from approving a booking request; does not skip payment.
export const adminConfirmPayment = (id) =>
  axiosInstance.patch(`/api/bookings/${id}/confirm-payment`);

// ADMIN: reject a payment (booking must be awaiting payment)
export const adminRejectPayment = (id) =>
  axiosInstance.patch(`/api/bookings/${id}/reject-payment`);

// GET MY BOOKINGS (As Guest)
export const getMyBookings = (params = {}) => 
  axiosInstance.get("/api/bookings/my", { params });

// GET BOOKINGS FOR HOST (As Host)
export const getHostBookings = (params = {}) => 
  axiosInstance.get("/api/bookings/host", { params });
