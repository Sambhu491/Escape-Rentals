import axiosInstance from "./axiosInstance";

// GET /api/comments/property/{propertyId} — public, paginated, top-level only
export const getPropertyComments = (propertyId, params = {}) =>
  axiosInstance.get(`/api/comments/property/${propertyId}`, { params });

// GET /api/comments/{id}/replies — public, flat list
export const getCommentReplies = (commentId) =>
  axiosInstance.get(`/api/comments/${commentId}/replies`);

// POST /api/comments — any authenticated account (USER, HOST, or ADMIN)
// data: { propertyId, content, parentCommentId? }
export const createComment = (data) =>
  axiosInstance.post("/api/comments", data);

// PUT /api/comments/{id} — author or admin
export const updateComment = (id, data) =>
  axiosInstance.put(`/api/comments/${id}`, data);

// DELETE /api/comments/{id} — author/admin hard-delete; property host soft-deletes
export const deleteComment = (id) =>
  axiosInstance.delete(`/api/comments/${id}`);

// GET /api/comments/admin — admin only, every comment platform-wide (incl. soft-deleted)
export const getAllCommentsForAdmin = (params = {}) =>
  axiosInstance.get("/api/comments/admin", { params });

// PATCH /api/comments/{id}/restore — admin only, undoes a host's soft-delete
export const restoreComment = (id) =>
  axiosInstance.patch(`/api/comments/${id}/restore`);
