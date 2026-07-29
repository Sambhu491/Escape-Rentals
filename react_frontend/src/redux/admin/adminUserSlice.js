import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getUsers,
  getUserById,
  enableUser as enableUserApi,
  disableUser as disableUserApi,
  deleteUser as deleteUserApi,
} from "../../api/adminApi"; 


export const DISABLE_DURATION = {
  WEEK: "WEEK",
  MONTH: "MONTH",
  YEAR: "YEAR",
  PERMANENT: "PERMANENT",
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



// GET /api/admin/users - Fetch all users (paginated)
export const fetchAllUsers = createAsyncThunk(
  "adminUser/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getUsers(params);

      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid users response");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// GET /api/admin/users/{id} - Fetch a single user by ID
export const fetchUserById = createAsyncThunk(
  "adminUser/fetchById",
  async (id, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue("User id required");
      }

      const response = await getUserById(id);

      if (!response) {
        return thunkAPI.rejectWithValue("User not found");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// DELETE /api/admin/users/{id} - Admin deletes a user (204 No Content)
export const deleteUser = createAsyncThunk(
  "adminUser/delete",
  async (id, thunkAPI) => {
    try {
      await deleteUserApi(id);

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PATCH /api/admin/users/{id}/disable - Disable a user account
// Dispatch as: disableUser({ id, data: { duration: DISABLE_DURATION.WEEK } })
export const disableUser = createAsyncThunk(
  "adminUser/disable",
  async ({ id, data }, thunkAPI) => {
    try {
      await disableUserApi(id, data);

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PATCH /api/admin/users/{id}/enable - Enable a user account
export const enableUser = createAsyncThunk(
  "adminUser/enable",
  async (id, thunkAPI) => {
    try {
      await enableUserApi(id);

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);



const initialState = {
  // All users list
  users: [],

  // Single user view
  selectedUser: null,

  // Pagination
  pagination: createPagination(),

  // Fetch statuses
  fetchStatus: {
    all: "idle",
    single: "idle",
  },

  // Mutation statuses
  mutationStatus: {
    delete: "idle",
    disable: "idle",
    enable: "idle",
  },

  // Errors
  error: null,

  mutationError: {
    delete: null,
    disable: null,
    enable: null,
  },
};


const adminUserSlice = createSlice({
  name: "adminUser",

  initialState,

  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },

    clearAdminUserErrors: (state) => {
      state.error = null;

      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },

    resetAdminUserState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

   
      .addCase(fetchAllUsers.pending, (state) => {
        state.fetchStatus.all = "loading";
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.fetchStatus.all = "succeeded";
        state.users = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.fetchStatus.all = "failed";
        state.error = action.payload || action.error.message;
      })

   
      .addCase(fetchUserById.pending, (state) => {
        state.fetchStatus.single = "loading";
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.fetchStatus.single = "succeeded";
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.fetchStatus.single = "failed";
        state.selectedUser = null;
        state.error = action.payload || action.error.message;
      })


      .addCase(deleteUser.pending, (state) => {
        state.mutationStatus.delete = "loading";
        state.mutationError.delete = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.mutationStatus.delete = "succeeded";
        const deletedId = action.payload;

        // Remove from users list
        state.users = state.users.filter((u) => u.id !== deletedId);

        // Clear selectedUser if it was the deleted user
        if (state.selectedUser?.id === deletedId) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.mutationStatus.delete = "failed";
        state.mutationError.delete = action.payload || action.error.message;
      })


      .addCase(disableUser.pending, (state) => {
        state.mutationStatus.disable = "loading";
        state.mutationError.disable = null;
      })
      .addCase(disableUser.fulfilled, (state, action) => {
        state.mutationStatus.disable = "succeeded";
        const disabledId = action.payload;

        // Patch enabled flag locally (204 No Content — no response body)
        const user = state.users.find((u) => u.id === disabledId);
        if (user) {
          user.enabled = false;
        }

        if (state.selectedUser?.id === disabledId) {
          state.selectedUser.enabled = false;
        }
      })
      .addCase(disableUser.rejected, (state, action) => {
        state.mutationStatus.disable = "failed";
        state.mutationError.disable = action.payload || action.error.message;
      })

      .addCase(enableUser.pending, (state) => {
        state.mutationStatus.enable = "loading";
        state.mutationError.enable = null;
      })
      .addCase(enableUser.fulfilled, (state, action) => {
        state.mutationStatus.enable = "succeeded";
        const enabledId = action.payload;

        // Patch enabled flag locally (200 OK — empty body)
        const user = state.users.find((u) => u.id === enabledId);
        if (user) {
          user.enabled = true;
        }

        if (state.selectedUser?.id === enabledId) {
          state.selectedUser.enabled = true;
        }
      })
      .addCase(enableUser.rejected, (state, action) => {
        state.mutationStatus.enable = "failed";
        state.mutationError.enable = action.payload || action.error.message;
      });
  },
});


export const { clearSelectedUser, clearAdminUserErrors, resetAdminUserState } =
  adminUserSlice.actions;



// Users list
export const selectAllUsers = (state) => state.adminUser.users;

// Single user
export const selectSelectedUser = (state) => state.adminUser.selectedUser;

// Pagination
export const selectUserPagination = (state) => state.adminUser.pagination;

// Fetch statuses
export const selectAdminUserFetchStatus = (state) =>
  state.adminUser.fetchStatus;

export const selectIsFetchingAllUsers = (state) =>
  state.adminUser.fetchStatus.all === "loading";

export const selectIsFetchingSingleUser = (state) =>
  state.adminUser.fetchStatus.single === "loading";

// Mutation statuses
export const selectAdminUserMutationStatus = (state) =>
  state.adminUser.mutationStatus;

export const selectAdminUserMutationError = (state) =>
  state.adminUser.mutationError;

// Individual mutation loading selectors
export const selectIsDeletingUser = (state) =>
  state.adminUser.mutationStatus.delete === "loading";

export const selectIsDisablingUser = (state) =>
  state.adminUser.mutationStatus.disable === "loading";

export const selectIsEnablingUser = (state) =>
  state.adminUser.mutationStatus.enable === "loading";

// Errors
export const selectAdminUserError = (state) => state.adminUser.error;

export default adminUserSlice.reducer;
