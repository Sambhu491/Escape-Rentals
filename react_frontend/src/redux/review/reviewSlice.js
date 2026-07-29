import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getReviews,
  getReview,
  getPropertyReviews,
  createReview as createReviewApi,
  updateReview as updateReviewApi,
  deleteReview as deleteReviewApi,
  getReviewReplies,
  createReviewReply as createReviewReplyApi,
  updateReviewReply as updateReviewReplyApi,
  deleteReviewReply as deleteReviewReplyApi,
  getReviewConcerns,
  getReviewConcern,
  createReviewConcern as createReviewConcernApi,
  updateReviewConcernStatus as updateReviewConcernStatusApi,
} from "../../api/reviewApi"; // Adjust path to match your project

// ==============================
// Constants
// ==============================

// Aligned with Spring Boot 'ConcernStatus' enum
export const CONCERN_STATUS = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

// ==============================
// Helpers
// ==============================

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

// ==============================
// Async Thunks — Reviews
// ==============================

// GET /api/reviews — Filtered list (ADMIN, HOST), paginated
export const fetchReviews = createAsyncThunk(
  "review/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getReviews(params);

      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid reviews response");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/reviews/{id} — Single review (public)
export const fetchReviewById = createAsyncThunk(
  "review/fetchById",
  async (id, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue("Review id required");
      }

      const response = await getReview(id);

      if (!response) {
        return thunkAPI.rejectWithValue("Review not found");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/reviews/property/{propertyId} — Property reviews (public), paginated
export const fetchPropertyReviews = createAsyncThunk(
  "review/fetchByProperty",
  async ({ propertyId, params = {} }, thunkAPI) => {
    try {
      if (!propertyId) {
        return thunkAPI.rejectWithValue("Property id required");
      }

      const response = await getPropertyReviews(propertyId, params);

      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid property reviews response");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /api/reviews — Create review (USER only)
export const createReview = createAsyncThunk(
  "review/create",
  async (data, thunkAPI) => {
    try {
      const response = await createReviewApi(data);

      if (!response) {
        return thunkAPI.rejectWithValue("Failed to create review");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PUT /api/reviews/{id} — Update review (USER, ADMIN)
export const updateReview = createAsyncThunk(
  "review/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await updateReviewApi(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// DELETE /api/reviews/{id} — Delete review (USER, ADMIN) — 204 No Content
export const deleteReview = createAsyncThunk(
  "review/delete",
  async (id, thunkAPI) => {
    try {
      await deleteReviewApi(id);

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// ==============================
// Async Thunks — Review Replies
// ==============================

// GET /api/review-replies/review/{reviewId} — Replies (public) — returns List, not Page
export const fetchReviewReplies = createAsyncThunk(
  "review/fetchReplies",
  async (reviewId, thunkAPI) => {
    try {
      if (!reviewId) {
        return thunkAPI.rejectWithValue("Review id required");
      }

      const response = await getReviewReplies(reviewId);

      return { reviewId, replies: Array.isArray(response) ? response : [] };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /api/review-replies — Create reply (HOST only)
export const createReviewReply = createAsyncThunk(
  "review/createReply",
  async (data, thunkAPI) => {
    try {
      const response = await createReviewReplyApi(data);

      if (!response) {
        return thunkAPI.rejectWithValue("Failed to create reply");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PUT /api/review-replies/{id} — Update reply (HOST only)
export const updateReviewReply = createAsyncThunk(
  "review/updateReply",
  async ({ id, data }, thunkAPI) => {
    try {
      return await updateReviewReplyApi(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// DELETE /api/review-replies/{id} — Delete reply (HOST, ADMIN) — 204 No Content
export const deleteReviewReply = createAsyncThunk(
  "review/deleteReply",
  async (id, thunkAPI) => {
    try {
      await deleteReviewReplyApi(id);

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// ==============================
// Async Thunks — Review Concerns
// ==============================

// GET /api/review-concerns — Filtered list (ADMIN only), paginated
export const fetchReviewConcerns = createAsyncThunk(
  "review/fetchConcerns",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getReviewConcerns(params);

      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid concerns response");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/review-concerns/{id} — Single concern (ADMIN only)
export const fetchReviewConcernById = createAsyncThunk(
  "review/fetchConcernById",
  async (id, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue("Concern id required");
      }

      const response = await getReviewConcern(id);

      if (!response) {
        return thunkAPI.rejectWithValue("Concern not found");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /api/review-concerns — Create concern (HOST only)
export const createReviewConcern = createAsyncThunk(
  "review/createConcern",
  async (data, thunkAPI) => {
    try {
      const response = await createReviewConcernApi(data);

      if (!response) {
        return thunkAPI.rejectWithValue("Failed to create concern");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PATCH /api/review-concerns/{id}/status — Update concern status (ADMIN only)
// status is sent as a query param, e.g. ?status=RESOLVED
export const updateReviewConcernStatus = createAsyncThunk(
  "review/updateConcernStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      return await updateReviewConcernStatusApi(id, status);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// ==============================
// Initial State
// ==============================

const initialState = {
  // Reviews
  reviews: [],            // Admin/Host filtered list
  propertyReviews: [],    // Public property-scoped list
  selectedReview: null,   // Single review detail

  // Replies — keyed by reviewId for efficient lookup
  // e.g. { 42: [reply1, reply2], 99: [reply3] }
  replies: {},

  // Concerns
  concerns: [],           // Admin filtered list
  selectedConcern: null,  // Single concern detail

  // Pagination
  reviewsPagination: createPagination(),
  propertyReviewsPagination: createPagination(),
  concernsPagination: createPagination(),

  // Fetch statuses
  fetchStatus: {
    reviews: "idle",
    propertyReviews: "idle",
    singleReview: "idle",
    replies: "idle",
    concerns: "idle",
    singleConcern: "idle",
  },

  // Mutation statuses
  mutationStatus: {
    createReview: "idle",
    updateReview: "idle",
    deleteReview: "idle",
    createReply: "idle",
    updateReply: "idle",
    deleteReply: "idle",
    createConcern: "idle",
    updateConcernStatus: "idle",
  },

  // Errors
  error: null,

  mutationError: {
    createReview: null,
    updateReview: null,
    deleteReview: null,
    createReply: null,
    updateReply: null,
    deleteReply: null,
    createConcern: null,
    updateConcernStatus: null,
  },
};

// ==============================
// Slice
// ==============================

const reviewSlice = createSlice({
  name: "review",

  initialState,

  reducers: {
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },

    clearSelectedConcern: (state) => {
      state.selectedConcern = null;
    },

    clearReviewErrors: (state) => {
      state.error = null;

      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },

    resetReviewState: () => initialState,
  },

  extraReducers: (builder) => {
    builder


      // FETCH ALL REVIEWS (Admin/Host filtered)

      .addCase(fetchReviews.pending, (state) => {
        state.fetchStatus.reviews = "loading";
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.fetchStatus.reviews = "succeeded";
        state.reviews = action.payload.content;
        state.reviewsPagination = extractPagination(action.payload);
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.fetchStatus.reviews = "failed";
        state.error = action.payload || action.error.message;
      })


      // FETCH SINGLE REVIEW

      .addCase(fetchReviewById.pending, (state) => {
        state.fetchStatus.singleReview = "loading";
        state.error = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.fetchStatus.singleReview = "succeeded";
        state.selectedReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.fetchStatus.singleReview = "failed";
        state.selectedReview = null;
        state.error = action.payload || action.error.message;
      })


      // FETCH PROPERTY REVIEWS

      .addCase(fetchPropertyReviews.pending, (state) => {
        state.fetchStatus.propertyReviews = "loading";
        state.error = null;
      })
      .addCase(fetchPropertyReviews.fulfilled, (state, action) => {
        state.fetchStatus.propertyReviews = "succeeded";
        state.propertyReviews = action.payload.content;
        state.propertyReviewsPagination = extractPagination(action.payload);
      })
      .addCase(fetchPropertyReviews.rejected, (state, action) => {
        state.fetchStatus.propertyReviews = "failed";
        state.error = action.payload || action.error.message;
      })


      // CREATE REVIEW

      .addCase(createReview.pending, (state) => {
        state.mutationStatus.createReview = "loading";
        state.mutationError.createReview = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.mutationStatus.createReview = "succeeded";
        // Prepend to all relevant lists
        state.reviews.unshift(action.payload);
        state.propertyReviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.mutationStatus.createReview = "failed";
        state.mutationError.createReview =
          action.payload || action.error.message;
      })


      // UPDATE REVIEW

      .addCase(updateReview.pending, (state) => {
        state.mutationStatus.updateReview = "loading";
        state.mutationError.updateReview = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.mutationStatus.updateReview = "succeeded";
        const updated = action.payload;

        // Sync reviews list
        const reviewsIdx = state.reviews.findIndex((r) => r.id === updated.id);
        if (reviewsIdx !== -1) {
          state.reviews[reviewsIdx] = updated;
        }

        // Sync property reviews list
        const propIdx = state.propertyReviews.findIndex(
          (r) => r.id === updated.id,
        );
        if (propIdx !== -1) {
          state.propertyReviews[propIdx] = updated;
        }

        // Sync selected review if open
        if (state.selectedReview?.id === updated.id) {
          state.selectedReview = updated;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.mutationStatus.updateReview = "failed";
        state.mutationError.updateReview =
          action.payload || action.error.message;
      })


      // DELETE REVIEW

      .addCase(deleteReview.pending, (state) => {
        state.mutationStatus.deleteReview = "loading";
        state.mutationError.deleteReview = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.mutationStatus.deleteReview = "succeeded";
        const deletedId = action.payload;

        state.reviews = state.reviews.filter((r) => r.id !== deletedId);
        state.propertyReviews = state.propertyReviews.filter(
          (r) => r.id !== deletedId,
        );

        // Also clean up replies for this review
        delete state.replies[deletedId];

        if (state.selectedReview?.id === deletedId) {
          state.selectedReview = null;
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.mutationStatus.deleteReview = "failed";
        state.mutationError.deleteReview =
          action.payload || action.error.message;
      })


      // FETCH REVIEW REPLIES

      .addCase(fetchReviewReplies.pending, (state) => {
        state.fetchStatus.replies = "loading";
        state.error = null;
      })
      .addCase(fetchReviewReplies.fulfilled, (state, action) => {
        state.fetchStatus.replies = "succeeded";
        const { reviewId, replies } = action.payload;
        // Store replies keyed by reviewId
        state.replies[reviewId] = replies;
      })
      .addCase(fetchReviewReplies.rejected, (state, action) => {
        state.fetchStatus.replies = "failed";
        state.error = action.payload || action.error.message;
      })


      // CREATE REVIEW REPLY

      .addCase(createReviewReply.pending, (state) => {
        state.mutationStatus.createReply = "loading";
        state.mutationError.createReply = null;
      })
      .addCase(createReviewReply.fulfilled, (state, action) => {
        state.mutationStatus.createReply = "succeeded";
        const reply = action.payload;
        const reviewId = reply.reviewId;

        // Append to the replies map for this reviewId
        if (!state.replies[reviewId]) {
          state.replies[reviewId] = [];
        }
        state.replies[reviewId].push(reply);
      })
      .addCase(createReviewReply.rejected, (state, action) => {
        state.mutationStatus.createReply = "failed";
        state.mutationError.createReply =
          action.payload || action.error.message;
      })


      // UPDATE REVIEW REPLY

      .addCase(updateReviewReply.pending, (state) => {
        state.mutationStatus.updateReply = "loading";
        state.mutationError.updateReply = null;
      })
      .addCase(updateReviewReply.fulfilled, (state, action) => {
        state.mutationStatus.updateReply = "succeeded";
        const updated = action.payload;
        const reviewId = updated.reviewId;

        if (state.replies[reviewId]) {
          const idx = state.replies[reviewId].findIndex(
            (r) => r.id === updated.id,
          );
          if (idx !== -1) {
            state.replies[reviewId][idx] = updated;
          }
        }
      })
      .addCase(updateReviewReply.rejected, (state, action) => {
        state.mutationStatus.updateReply = "failed";
        state.mutationError.updateReply =
          action.payload || action.error.message;
      })


      // DELETE REVIEW REPLY

      .addCase(deleteReviewReply.pending, (state) => {
        state.mutationStatus.deleteReply = "loading";
        state.mutationError.deleteReply = null;
      })
      .addCase(deleteReviewReply.fulfilled, (state, action) => {
        state.mutationStatus.deleteReply = "succeeded";
        const deletedReplyId = action.payload;

        // Search across all reviewId buckets and remove the reply
        Object.keys(state.replies).forEach((reviewId) => {
          state.replies[reviewId] = state.replies[reviewId].filter(
            (r) => r.id !== deletedReplyId,
          );
        });
      })
      .addCase(deleteReviewReply.rejected, (state, action) => {
        state.mutationStatus.deleteReply = "failed";
        state.mutationError.deleteReply =
          action.payload || action.error.message;
      })


      // FETCH ALL REVIEW CONCERNS (Admin)

      .addCase(fetchReviewConcerns.pending, (state) => {
        state.fetchStatus.concerns = "loading";
        state.error = null;
      })
      .addCase(fetchReviewConcerns.fulfilled, (state, action) => {
        state.fetchStatus.concerns = "succeeded";
        state.concerns = action.payload.content;
        state.concernsPagination = extractPagination(action.payload);
      })
      .addCase(fetchReviewConcerns.rejected, (state, action) => {
        state.fetchStatus.concerns = "failed";
        state.error = action.payload || action.error.message;
      })


      // FETCH SINGLE REVIEW CONCERN (Admin)

      .addCase(fetchReviewConcernById.pending, (state) => {
        state.fetchStatus.singleConcern = "loading";
        state.error = null;
      })
      .addCase(fetchReviewConcernById.fulfilled, (state, action) => {
        state.fetchStatus.singleConcern = "succeeded";
        state.selectedConcern = action.payload;
      })
      .addCase(fetchReviewConcernById.rejected, (state, action) => {
        state.fetchStatus.singleConcern = "failed";
        state.selectedConcern = null;
        state.error = action.payload || action.error.message;
      })


      // CREATE REVIEW CONCERN (Host)

      .addCase(createReviewConcern.pending, (state) => {
        state.mutationStatus.createConcern = "loading";
        state.mutationError.createConcern = null;
      })
      .addCase(createReviewConcern.fulfilled, (state, action) => {
        state.mutationStatus.createConcern = "succeeded";
        state.concerns.unshift(action.payload);
      })
      .addCase(createReviewConcern.rejected, (state, action) => {
        state.mutationStatus.createConcern = "failed";
        state.mutationError.createConcern =
          action.payload || action.error.message;
      })

      // UPDATE REVIEW CONCERN STATUS (Admin)
    
      .addCase(updateReviewConcernStatus.pending, (state) => {
        state.mutationStatus.updateConcernStatus = "loading";
        state.mutationError.updateConcernStatus = null;
      })
      .addCase(updateReviewConcernStatus.fulfilled, (state, action) => {
        state.mutationStatus.updateConcernStatus = "succeeded";
        const updated = action.payload;

        const idx = state.concerns.findIndex((c) => c.id === updated.id);
        if (idx !== -1) {
          state.concerns[idx] = updated;
        }

        if (state.selectedConcern?.id === updated.id) {
          state.selectedConcern = updated;
        }
      })
      .addCase(updateReviewConcernStatus.rejected, (state, action) => {
        state.mutationStatus.updateConcernStatus = "failed";
        state.mutationError.updateConcernStatus =
          action.payload || action.error.message;
      });
  },
});


export const {
  clearSelectedReview,
  clearSelectedConcern,
  clearReviewErrors,
  resetReviewState,
} = reviewSlice.actions;


// Reviews
export const selectAllReviews = (state) => state.review.reviews;
export const selectPropertyReviews = (state) => state.review.propertyReviews;
export const selectSelectedReview = (state) => state.review.selectedReview;

// Bug fix: `?? []` created a brand-new array reference on every call when a
// review had no replies yet, which fails useSelector's reference-equality
// check and triggers React-Redux's "selector returned a different result"
// warning + extra re-renders. Reusing one stable empty array fixes it.
const EMPTY_REPLIES = [];

// Replies — pass reviewId to select replies for a specific review
export const selectRepliesByReviewId = (reviewId) => (state) =>
  state.review.replies[reviewId] ?? EMPTY_REPLIES;

// Concerns
export const selectAllConcerns = (state) => state.review.concerns;
export const selectSelectedConcern = (state) => state.review.selectedConcern;

// Pagination
export const selectReviewsPagination = (state) =>
  state.review.reviewsPagination;
export const selectPropertyReviewsPagination = (state) =>
  state.review.propertyReviewsPagination;
export const selectConcernsPagination = (state) =>
  state.review.concernsPagination;

// Fetch statuses
export const selectReviewFetchStatus = (state) => state.review.fetchStatus;

export const selectIsFetchingReviews = (state) =>
  state.review.fetchStatus.reviews === "loading";
export const selectIsFetchingPropertyReviews = (state) =>
  state.review.fetchStatus.propertyReviews === "loading";
export const selectIsFetchingSingleReview = (state) =>
  state.review.fetchStatus.singleReview === "loading";
export const selectIsFetchingReplies = (state) =>
  state.review.fetchStatus.replies === "loading";
export const selectIsFetchingConcerns = (state) =>
  state.review.fetchStatus.concerns === "loading";
export const selectIsFetchingSingleConcern = (state) =>
  state.review.fetchStatus.singleConcern === "loading";

// Mutation statuses
export const selectReviewMutationStatus = (state) =>
  state.review.mutationStatus;
export const selectReviewMutationError = (state) =>
  state.review.mutationError;

// Individual mutation loading selectors
export const selectIsCreatingReview = (state) =>
  state.review.mutationStatus.createReview === "loading";
export const selectIsUpdatingReview = (state) =>
  state.review.mutationStatus.updateReview === "loading";
export const selectIsDeletingReview = (state) =>
  state.review.mutationStatus.deleteReview === "loading";
export const selectIsCreatingReply = (state) =>
  state.review.mutationStatus.createReply === "loading";
export const selectIsUpdatingReply = (state) =>
  state.review.mutationStatus.updateReply === "loading";
export const selectIsDeletingReply = (state) =>
  state.review.mutationStatus.deleteReply === "loading";
export const selectIsCreatingConcern = (state) =>
  state.review.mutationStatus.createConcern === "loading";
export const selectIsUpdatingConcernStatus = (state) =>
  state.review.mutationStatus.updateConcernStatus === "loading";

// Errors
export const selectReviewError = (state) => state.review.error;

export default reviewSlice.reducer;
