import axiosInstance from "./axiosInstance";

// POST /api/properties — multipart/form-data (HOST, ADMIN)
// Backend expects:
//   @RequestPart("property") → JSON blob of CreatePropertyRequest
//   @RequestPart("images")   → List<MultipartFile>
// Build FormData in the thunk; just pass it here.
export const createProperty = (formData) =>
  axiosInstance.post("/api/properties", formData);

// GET /api/properties — public, paginated
export const getProperties = (params = {}) =>
  axiosInstance.get("/api/properties", { params });

// GET /api/properties/{id} — public
export const getProperty = (id) =>
  axiosInstance.get(`/api/properties/${id}`);

// GET /api/properties/search — public, filtered + paginated
export const searchProperties = (params = {}) =>
  axiosInstance.get("/api/properties/search", { params });

// GET /api/properties/my-properties — HOST only, returns List (not Page)
export const myProperties = () =>
  axiosInstance.get("/api/properties/my-properties");

// GET /api/properties/admin/get-property — ADMIN only, paginated (includes deleted)
export const getAdminProperties = (params = {}) =>
  axiosInstance.get("/api/properties/admin/get-property", { params });

// PUT /api/properties/{id} — HOST or ADMIN
export const updateProperty = (id, data) =>
  axiosInstance.put(`/api/properties/${id}`, data);

// DELETE /api/properties/{id} — HOST or ADMIN — 204 No Content (soft delete)
export const deleteProperty = (id) =>
  axiosInstance.delete(`/api/properties/${id}`);

// POST /api/properties/{id}/images — HOST or ADMIN — multipart/form-data
// formData should contain "images" parts
export const uploadImages = (id, formData) =>
  axiosInstance.post(`/api/properties/${id}/images`, formData);

// DELETE /api/properties/{propertyId}/images/{imageId} — HOST or ADMIN — 204 No Content
export const deletePropertyImage = (propertyId, imageId) =>
  axiosInstance.delete(`/api/properties/${propertyId}/images/${imageId}`);

// GET /api/properties/{id}/availability — public
// params: { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
// Returns: List<AvailabilityResponse> [{ checkInDate, checkOutDate }]
export const getAvailability = (id, params = {}) =>
  axiosInstance.get(`/api/properties/${id}/availability`,{ params });

export const getCities = () =>
    axiosInstance.get("/api/properties/cities");
