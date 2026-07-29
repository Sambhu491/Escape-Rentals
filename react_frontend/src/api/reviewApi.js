import axiosInstance from "./axiosInstance";

// ============================================================
// REVIEWS — /api/reviews
// ============================================================

// GET /api/reviews — Filtered list (ADMIN, HOST) - paginated
export const getReviews = (params = {}) =>
  axiosInstance.get("/api/reviews", { params });

// GET /api/reviews/{id} — Single review (public)
export const getReview = (id) =>
  axiosInstance.get(`/api/reviews/${id}`);

// GET /api/reviews/property/{propertyId} — Property reviews (public, paginated)
export const getPropertyReviews = (propertyId, params = {}) =>
  axiosInstance.get(`/api/reviews/property/${propertyId}`, { params });

// POST /api/reviews — Create review (USER only)
export const createReview = (data) =>
  axiosInstance.post("/api/reviews", data);

// PUT /api/reviews/{id} — Update review (USER, ADMIN)
export const updateReview = (id, data) =>
  axiosInstance.put(`/api/reviews/${id}`, data);

// DELETE /api/reviews/{id} — Delete review (USER, ADMIN) — 204 No Content
export const deleteReview = (id) =>
  axiosInstance.delete(`/api/reviews/${id}`);

// ============================================================
// REVIEW REPLIES — /api/review-replies
// ============================================================

// GET /api/review-replies/review/{reviewId} — Get replies (public) — returns List, not Page
export const getReviewReplies = (reviewId) =>
  axiosInstance.get(`/api/review-replies/review/${reviewId}`);

// POST /api/review-replies — Create reply (HOST only)
export const createReviewReply = (data) =>
  axiosInstance.post("/api/review-replies", data);

// PUT /api/review-replies/{id} — Update reply (HOST only)
export const updateReviewReply = (id, data) =>
  axiosInstance.put(`/api/review-replies/${id}`, data);

// DELETE /api/review-replies/{id} — Delete reply (HOST, ADMIN) — 204 No Content
export const deleteReviewReply = (id) =>
  axiosInstance.delete(`/api/review-replies/${id}`);

// ============================================================
// REVIEW CONCERNS — /api/review-concerns
// ============================================================

// GET /api/review-concerns — Filtered list (ADMIN only, paginated)
export const getReviewConcerns = (params = {}) =>
  axiosInstance.get("/api/review-concerns", { params });

// GET /api/review-concerns/{id} — Single concern (ADMIN only)
export const getReviewConcern = (id) =>
  axiosInstance.get(`/api/review-concerns/${id}`);

// POST /api/review-concerns — Create concern (HOST only)
export const createReviewConcern = (data) =>
  axiosInstance.post("/api/review-concerns", data);

// PATCH /api/review-concerns/{id}/status — Update concern status (ADMIN only)
// Backend uses @RequestParam — status is a query parameter, NOT a request body
export const updateReviewConcernStatus = (id, status) =>
  axiosInstance.patch(`/api/review-concerns/${id}/status`, null, {
    params: { status },
  });
