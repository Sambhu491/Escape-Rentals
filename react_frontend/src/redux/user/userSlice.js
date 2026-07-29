import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getUser,
  updateUser as updateUserApi,
  deleteMyAccount as deleteMyAccountApi,
} from "../../api/userApi"; 


const getErrorMessage = (error) =>
  error.response?.data?.message || error.message;

// GET /api/users/{id} - Fetch own profile
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrent",
  async (id, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue("User id required");
      }
      const response = await getUser(id);
      if (!response) {
        return thunkAPI.rejectWithValue("User not found");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// PUT /api/users/{id} - Update own profile
export const updateCurrentUser = createAsyncThunk(
  "user/updateCurrent",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateUserApi(id, data);

      if (!response) {
        return thunkAPI.rejectWithValue("Failed to update profile");
      }

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// DELETE /api/users/me -
export const deleteMyAccount = createAsyncThunk(
  "user/deleteSelf",
  async (_, thunkAPI) => {
    try {
      await deleteMyAccountApi();

      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);


const initialState = {
  // Authenticated user's own profile
  currentUser: null,

  // Fetch status
  fetchStatus: "idle",

  // Mutation statuses
  mutationStatus: {
    update: "idle",
    deleteSelf: "idle",
  },

  // Errors
  error: null,

  mutationError: {
    update: null,
    deleteSelf: null,
  },
};

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.error = null;
    },

    clearUserErrors: (state) => {
      state.error = null;

      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },

    resetUserState: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // FETCH CURRENT USER (Own Profile)
      .addCase(fetchCurrentUser.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || action.error.message;
      })

      // UPDATE CURRENT USER (Own Profile)
      .addCase(updateCurrentUser.pending, (state) => {
        state.mutationStatus.update = "loading";
        state.mutationError.update = null;
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.mutationStatus.update = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(updateCurrentUser.rejected, (state, action) => {
        state.mutationStatus.update = "failed";
        state.mutationError.update = action.payload || action.error.message;
      })

      // DELETE OWN ACCOUNT
      .addCase(deleteMyAccount.pending, (state) => {
        state.mutationStatus.deleteSelf = "loading";
        state.mutationError.deleteSelf = null;
      })
      .addCase(deleteMyAccount.fulfilled, (state) => {
        state.mutationStatus.deleteSelf = "succeeded";
        // Clear profile — also dispatch auth logout in your component
        state.currentUser = null;
      })
      .addCase(deleteMyAccount.rejected, (state, action) => {
        state.mutationStatus.deleteSelf = "failed";
        state.mutationError.deleteSelf = action.payload || action.error.message;
      });
  },
});



export const { clearCurrentUser, clearUserErrors, resetUserState } =
  userSlice.actions;


// Own profile
export const selectCurrentUser = (state) => state.user.currentUser;

// Fetch status
export const selectUserFetchStatus = (state) => state.user.fetchStatus;
export const selectIsFetchingCurrentUser = (state) =>
  state.user.fetchStatus === "loading";

// Mutation status
export const selectUserMutationStatus = (state) => state.user.mutationStatus;
export const selectUserMutationError = (state) => state.user.mutationError;

export const selectIsUpdatingUser = (state) =>
  state.user.mutationStatus.update === "loading";

export const selectIsDeletingOwnAccount = (state) =>
  state.user.mutationStatus.deleteSelf === "loading";

// Errors
export const selectUserError = (state) => state.user.error;

export default userSlice.reducer;
