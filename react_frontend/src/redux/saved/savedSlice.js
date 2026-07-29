import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  saveProperty as savePropertyApi,
  unsaveProperty as unsavePropertyApi,
  getMySavedProperties,
  getMySavedPropertyIds,
} from "../../api/savedApi";

const createPagination = () => ({
  page: 0,
  size: 12,
  totalPages: 0,
  totalElements: 0,
});

const extractPagination = (response) => ({
  page: response.number,
  size: response.size,
  totalPages: response.totalPages,
  totalElements: response.totalElements,
});

const getErrorMessage = (error) => error.response?.data?.message || error.message;

// Kept separate from `properties` (the full PropertyResponse list rendered on
// /account/saved) — this is the lightweight id list the heart icon on every
// PropertyCard/PropertyDetailPage checks against, fetched once app-wide.
export const fetchSavedPropertyIds = createAsyncThunk(
  "saved/fetchIds",
  async (_, thunkAPI) => {
    try {
      return await getMySavedPropertyIds();
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchSavedProperties = createAsyncThunk(
  "saved/fetchMine",
  async (params = {}, thunkAPI) => {
    try {
      const response = await getMySavedProperties(params);
      if (!response?.content) {
        return thunkAPI.rejectWithValue("Invalid saved properties response");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const toggleSaveProperty = createAsyncThunk(
  "saved/toggle",
  async ({ propertyId, isSaved }, thunkAPI) => {
    try {
      if (isSaved) {
        await unsavePropertyApi(propertyId);
        return { propertyId, saved: false };
      }
      await savePropertyApi(propertyId);
      return { propertyId, saved: true };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

const initialState = {
  savedIds: [],
  savedIdsStatus: "idle",
  properties: [],
  pagination: createPagination(),
  fetchStatus: "idle",
  toggleStatus: "idle",
  error: null,
};

const savedSlice = createSlice({
  name: "saved",
  initialState,
  reducers: {
    clearSavedErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedPropertyIds.pending, (state) => {
        state.savedIdsStatus = "loading";
      })
      .addCase(fetchSavedPropertyIds.fulfilled, (state, action) => {
        state.savedIdsStatus = "succeeded";
        state.savedIds = action.payload;
      })
      .addCase(fetchSavedPropertyIds.rejected, (state, action) => {
        state.savedIdsStatus = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchSavedProperties.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchSavedProperties.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.properties = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchSavedProperties.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(toggleSaveProperty.pending, (state) => {
        state.toggleStatus = "loading";
      })
      .addCase(toggleSaveProperty.fulfilled, (state, action) => {
        state.toggleStatus = "succeeded";
        const { propertyId, saved } = action.payload;
        if (saved) {
          if (!state.savedIds.includes(propertyId)) state.savedIds.push(propertyId);
        } else {
          state.savedIds = state.savedIds.filter((id) => id !== propertyId);
          state.properties = state.properties.filter((p) => p.id !== propertyId);
        }
      })
      .addCase(toggleSaveProperty.rejected, (state, action) => {
        state.toggleStatus = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSavedErrors } = savedSlice.actions;

export const selectSavedPropertyIds = (state) => state.saved.savedIds;
export const selectSavedProperties = (state) => state.saved.properties;
export const selectSavedPagination = (state) => state.saved.pagination;
export const selectSavedFetchStatus = (state) => state.saved.fetchStatus;

export default savedSlice.reducer;
