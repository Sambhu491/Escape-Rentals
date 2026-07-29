import axiosInstance from "./axiosInstance";

// POST /api/payments/order/{bookingId}
// Returns: CreateOrderResponse { orderId, amount, currency, key }
export const createOrder = (bookingId) =>
  axiosInstance.post(`/api/payments/order/${bookingId}`);

// POST /api/payments/verify
// Returns: 200 OK empty body (Void)
// data: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
export const verifyPayment = (data) =>
  axiosInstance.post("/api/payments/verify", data);

// GET /api/payments/{bookingId}
// Returns: PaymentResponse
export const getPayment = (bookingId) =>
  axiosInstance.get(`/api/payments/${bookingId}`);

// GET /api/payments/admin
// Returns: Page<PaymentResponse>
// params: { page, size, sort }
export const getPayments = (params = {}) =>
  axiosInstance.get("/api/payments/admin", { params });
