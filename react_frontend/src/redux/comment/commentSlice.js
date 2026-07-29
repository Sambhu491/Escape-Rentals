import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getPropertyComments,
  getCommentReplies,
  createComment as createCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  getAllCommentsForAdmin,
  restoreComment as restoreCommentApi,
} from "../../api/commentApi";

// Aligned with Spring Boot 'AuthorBadge' enum — computed server-side per
// comment based on whether the author is the property's host or has a
// COMPLETED booking there. Reviews don't need this: the backend only lets a
// guest review after a completed stay, so every review is inherently verified.
export const AUTHOR_BADGE = {
  VERIFIED_GUEST: "VERIFIED_GUEST",
  HOST: "HOST",
  MEMBER: "MEMBER",
};

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

// GET /api/comments/property/{propertyId}
export const fetchPropertyComments = createAsyncThunk(
  "comment/fetchByProperty",
  async ({ propertyId, params = {} }, thunkAPI) => {
    try {
      const response = await getPropertyComments(propertyId, params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid comments response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/comments/{id}/replies
export const fetchCommentReplies = createAsyncThunk(
  "comment/fetchReplies",
  async (commentId, thunkAPI) => {
    try {
      const response = await getCommentReplies(commentId);
      return { commentId, replies: Array.isArray(response) ? response : [] };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /api/comments — data: { propertyId, content, parentCommentId? }
export const createCommentAsync = createAsyncThunk(
  "comment/create",
  async (data, thunkAPI) => {
    try {
      const response = await createCommentApi(data);
      if (!response) {
        return thunkAPI.rejectWithValue("Failed to post comment");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PUT /api/comments/{id} — pass parentCommentId through so the reducer knows
// whether to patch the top-level list or a nested replies bucket.
export const updateCommentAsync = createAsyncThunk(
  "comment/update",
  async ({ id, data, parentCommentId = null }, thunkAPI) => {
    try {
      const response = await updateCommentApi(id, data);
      return { ...response, __parentCommentId: parentCommentId };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// DELETE /api/comments/{id} — 204 No Content
export const deleteCommentAsync = createAsyncThunk(
  "comment/delete",
  async ({ id, parentCommentId = null }, thunkAPI) => {
    try {
      await deleteCommentApi(id);
      return { id, parentCommentId };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/comments/admin — admin moderation listing (includes soft-deleted)
export const fetchAllCommentsForAdmin = createAsyncThunk(
  "comment/fetchAllForAdmin",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getAllCommentsForAdmin(params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid comments response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PATCH /api/comments/{id}/restore
export const restoreCommentAsync = createAsyncThunk(
  "comment/restore",
  async (id, thunkAPI) => {
    try {
      const response = await restoreCommentApi(id);
      if (!response) {
        return thunkAPI.rejectWithValue("Failed to restore comment");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

const initialState = {
  propertyComments: [],
  pagination: createPagination(),

  // Admin moderation listing — every comment platform-wide, incl. soft-deleted
  adminComments: [],
  adminPagination: createPagination(),

  // Replies keyed by parent comment id, e.g. { 42: [reply1, reply2] }
  replies: {},

  fetchStatus: {
    comments: "idle",
    replies: "idle",
    adminComments: "idle",
  },

  mutationStatus: {
    create: "idle",
    update: "idle",
    delete: "idle",
    restore: "idle",
  },

  error: null,

  mutationError: {
    create: null,
    update: null,
    delete: null,
    restore: null,
  },
};

const commentSlice = createSlice({
  name: "comment",

  initialState,

  reducers: {
    clearCommentErrors: (state) => {
      state.error = null;
      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },
    resetCommentState: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // FETCH PROPERTY COMMENTS
      .addCase(fetchPropertyComments.pending, (state) => {
        state.fetchStatus.comments = "loading";
        state.error = null;
      })
      .addCase(fetchPropertyComments.fulfilled, (state, action) => {
        state.fetchStatus.comments = "succeeded";
        state.propertyComments = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchPropertyComments.rejected, (state, action) => {
        state.fetchStatus.comments = "failed";
        state.error = action.payload || action.error.message;
      })

      // FETCH REPLIES
      .addCase(fetchCommentReplies.pending, (state) => {
        state.fetchStatus.replies = "loading";
      })
      .addCase(fetchCommentReplies.fulfilled, (state, action) => {
        state.fetchStatus.replies = "succeeded";
        const { commentId, replies } = action.payload;
        state.replies[commentId] = replies;
      })
      .addCase(fetchCommentReplies.rejected, (state, action) => {
        state.fetchStatus.replies = "failed";
        state.error = action.payload || action.error.message;
      })

      // CREATE COMMENT
      .addCase(createCommentAsync.pending, (state) => {
        state.mutationStatus.create = "loading";
        state.mutationError.create = null;
      })
      .addCase(createCommentAsync.fulfilled, (state, action) => {
        state.mutationStatus.create = "succeeded";
        const comment = action.payload;

        if (!comment.parentCommentId) {
          state.propertyComments.unshift(comment);
        } else {
          if (!state.replies[comment.parentCommentId]) {
            state.replies[comment.parentCommentId] = [];
          }
          state.replies[comment.parentCommentId].push(comment);

          const parent = state.propertyComments.find((c) => c.id === comment.parentCommentId);
          if (parent) parent.replyCount = (parent.replyCount || 0) + 1;
        }
      })
      .addCase(createCommentAsync.rejected, (state, action) => {
        state.mutationStatus.create = "failed";
        state.mutationError.create = action.payload || action.error.message;
      })

      // UPDATE COMMENT
      .addCase(updateCommentAsync.pending, (state) => {
        state.mutationStatus.update = "loading";
        state.mutationError.update = null;
      })
      .addCase(updateCommentAsync.fulfilled, (state, action) => {
        state.mutationStatus.update = "succeeded";
        const { __parentCommentId, ...updated } = action.payload;

        if (!__parentCommentId) {
          const idx = state.propertyComments.findIndex((c) => c.id === updated.id);
          if (idx !== -1) state.propertyComments[idx] = updated;
        } else if (state.replies[__parentCommentId]) {
          const idx = state.replies[__parentCommentId].findIndex((c) => c.id === updated.id);
          if (idx !== -1) state.replies[__parentCommentId][idx] = updated;
        }
      })
      .addCase(updateCommentAsync.rejected, (state, action) => {
        state.mutationStatus.update = "failed";
        state.mutationError.update = action.payload || action.error.message;
      })

      // DELETE COMMENT
      .addCase(deleteCommentAsync.pending, (state) => {
        state.mutationStatus.delete = "loading";
        state.mutationError.delete = null;
      })
      .addCase(deleteCommentAsync.fulfilled, (state, action) => {
        state.mutationStatus.delete = "succeeded";
        const { id, parentCommentId } = action.payload;

        // Also drop it from the admin moderation list, if loaded — admin's
        // delete is permanent (unlike a host's soft-delete, which the backend
        // still returns from /admin so it can be restored).
        state.adminComments = state.adminComments.filter((c) => c.id !== id);

        if (!parentCommentId) {
          state.propertyComments = state.propertyComments.filter((c) => c.id !== id);
          delete state.replies[id];
        } else if (state.replies[parentCommentId]) {
          state.replies[parentCommentId] = state.replies[parentCommentId].filter((c) => c.id !== id);
          const parent = state.propertyComments.find((c) => c.id === parentCommentId);
          if (parent) parent.replyCount = Math.max(0, (parent.replyCount || 1) - 1);
        }
      })
      .addCase(deleteCommentAsync.rejected, (state, action) => {
        state.mutationStatus.delete = "failed";
        state.mutationError.delete = action.payload || action.error.message;
      })

      // FETCH ALL COMMENTS (Admin)
      .addCase(fetchAllCommentsForAdmin.pending, (state) => {
        state.fetchStatus.adminComments = "loading";
        state.error = null;
      })
      .addCase(fetchAllCommentsForAdmin.fulfilled, (state, action) => {
        state.fetchStatus.adminComments = "succeeded";
        state.adminComments = action.payload.content;
        state.adminPagination = extractPagination(action.payload);
      })
      .addCase(fetchAllCommentsForAdmin.rejected, (state, action) => {
        state.fetchStatus.adminComments = "failed";
        state.error = action.payload || action.error.message;
      })

      // RESTORE COMMENT (Admin)
      .addCase(restoreCommentAsync.pending, (state) => {
        state.mutationStatus.restore = "loading";
        state.mutationError.restore = null;
      })
      .addCase(restoreCommentAsync.fulfilled, (state, action) => {
        state.mutationStatus.restore = "succeeded";
        const updated = action.payload;
        const idx = state.adminComments.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.adminComments[idx] = updated;
      })
      .addCase(restoreCommentAsync.rejected, (state, action) => {
        state.mutationStatus.restore = "failed";
        state.mutationError.restore = action.payload || action.error.message;
      });
  },
});

export const { clearCommentErrors, resetCommentState } = commentSlice.actions;

export const selectPropertyComments = (state) => state.comment.propertyComments;
export const selectCommentsPagination = (state) => state.comment.pagination;

export const selectAdminComments = (state) => state.comment.adminComments;
export const selectAdminCommentsPagination = (state) => state.comment.adminPagination;

// Same reasoning as reviewSlice's selectRepliesByReviewId: reuse one stable
// empty array so useSelector's reference check doesn't see a "new" value on
// every render when a comment has no replies yet.
const EMPTY_REPLIES = [];
export const selectRepliesByCommentId = (commentId) => (state) =>
  state.comment.replies[commentId] ?? EMPTY_REPLIES;

export const selectCommentFetchStatus = (state) => state.comment.fetchStatus;
export const selectCommentMutationStatus = (state) => state.comment.mutationStatus;
export const selectCommentMutationError = (state) => state.comment.mutationError;

export const selectIsCreatingComment = (state) => state.comment.mutationStatus.create === "loading";
export const selectIsUpdatingComment = (state) => state.comment.mutationStatus.update === "loading";
export const selectIsDeletingComment = (state) => state.comment.mutationStatus.delete === "loading";

export default commentSlice.reducer;
