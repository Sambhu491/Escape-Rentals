import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getProperties,
  getProperty,
  searchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadImages,
  deletePropertyImage,
  myProperties,
  getAdminProperties,
  getAvailability,
  getCities,
} from "../../api/propertyApi";

// ─── Constants ────────────────────────────────────────────────

export const PROPERTY_STATUS = {
  AVAILABLE: "AVAILABLE",
  UNAVAILABLE: "UNAVAILABLE",
  UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
};

export const BOOKING_APPROVAL_TYPE = {
  AUTO: "AUTO",
  MANUAL: "MANUAL",
};

// ─── Helpers ──────────────────────────────────────────────────

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

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message;

/**
 * Safely removes an image from an images array.
 * Handles both object images ({ id, imageId, imageUrl }) and plain string URLs.
 */
const removeImageById = (images, imageId) => {
  if (!Array.isArray(images)) return images;
  return images.filter((img) => {
    if (typeof img === "string") {
      return img !== imageId;
    }
    return img.id !== imageId && img.imageId !== imageId;
  });
};

/**
 * Syncs an updated property object into a list by ID.
 */
const syncUpdatedProperty = (list, updated) => {
  const idx = list.findIndex((p) => p.id === updated.id);
  if (idx !== -1) list[idx] = updated;
};

// ─── Async Thunks — Fetch ─────────────────────────────────────

export const fetchProperties = createAsyncThunk(
  "properties/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const data = await getProperties(params);
      if (!data || !Array.isArray(data.content)) {
        return thunkAPI.rejectWithValue("Invalid property response");
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchPropertyById = createAsyncThunk(
  "properties/fetchById",
  async (id, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue("Invalid property id");
      }
      const data = await getProperty(id);
      if (!data) {
        return thunkAPI.rejectWithValue("Property not found");
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const searchPropertiesAsync = createAsyncThunk(
  "properties/search",
  async (params = {}, thunkAPI) => {
    try {
      const data = await searchProperties(params);
      if (!data || !Array.isArray(data.content)) {
        return thunkAPI.rejectWithValue("Invalid search response");
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchMyProperties = createAsyncThunk(
  "properties/myProperties",
  async (_, thunkAPI) => {
    try {
      const data = await myProperties();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchAdminProperties = createAsyncThunk(
  "properties/fetchAdmin",
  async (params = {}, thunkAPI) => {
    try {
      const data = await getAdminProperties(params);
      if (!data || !Array.isArray(data.content)) {
        return thunkAPI.rejectWithValue("Invalid admin properties response");
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchPropertyAvailability = createAsyncThunk(
  "properties/fetchAvailability",
  async ({ id, from, to }, thunkAPI) => {
    try {
      if (!id || !from || !to) {
        return thunkAPI.rejectWithValue(
          "Property id, from and to dates are required",
        );
      }
      const data = await getAvailability(id, { from, to });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// ─── Async Thunks — Mutations ─────────────────────────────────

export const createPropertyAsync = createAsyncThunk(
  "properties/create",
  async ({ propertyData, images }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append(
        "property",
        new Blob([JSON.stringify(propertyData)], {
          type: "application/json",
        }),
      );
      images.forEach((image) => formData.append("images", image));

      const response = await createProperty(formData);
      if (!response) {
        return thunkAPI.rejectWithValue("Failed to create property");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updatePropertyAsync = createAsyncThunk(
  "properties/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateProperty(id, data);
      if (!response) {
        return thunkAPI.rejectWithValue("Failed to update property");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deletePropertyAsync = createAsyncThunk(
  "properties/delete",
  async (id, thunkAPI) => {
    try {
      await deleteProperty(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const uploadPropertyImagesAsync = createAsyncThunk(
  "properties/uploadImages",
  async ({ id, images }, thunkAPI) => {
    try {
      const formData = new FormData();
      images.forEach((image) => formData.append("images", image));
      const response = await uploadImages(id, formData);
      if (!response) {
        return thunkAPI.rejectWithValue("Failed to upload images");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deletePropertyImageAsync = createAsyncThunk(
  "properties/deleteImage",
  async ({ propertyId, imageId }, thunkAPI) => {
    try {
      await deletePropertyImage(propertyId, imageId);
      return { propertyId, imageId };
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchCities = createAsyncThunk(
  "properties/fetchAllCities",
  async (_, thunkAPI) => {
    try {
      const data = await getCities();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// ─── Initial State ────────────────────────────────────────────

const initialState = {
  cities: [],
  cityStatus: "idle",
  cityError: null,

  properties: [],
  adminProperties: [],
  myProperties: [],

  selectedProperty: null,
  availability: [],

  pagination: createPagination(),
  adminPagination: createPagination(),

  fetchStatus: {
    all: "idle",
    single: "idle",
    search: "idle",
    mine: "idle",
    admin: "idle",
    availability: "idle",
  },

  mutationStatus: {
    create: "idle",
    update: "idle",
    delete: "idle",
    uploadImages: "idle",
    deleteImage: "idle",
  },

  error: null,

  mutationError: {
    create: null,
    update: null,
    delete: null,
    uploadImages: null,
    deleteImage: null,
  },
};

// ─── Slice ────────────────────────────────────────────────────

export const propertySlice = createSlice({
  name: "properties",
  initialState,

  reducers: {
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
      state.error = null;
    },

    clearAvailability: (state) => {
      state.availability = [];
      state.fetchStatus.availability = "idle";
    },

    clearPropertyErrors: (state) => {
      state.error = null;
      Object.keys(state.mutationError).forEach((key) => {
        state.mutationError[key] = null;
      });
    },

    resetPropertyState: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // ── Cities ──
      .addCase(fetchCities.pending, (state) => {
        state.cityStatus = "loading";
        state.cityError = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cityStatus = "succeeded";
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.cityStatus = "failed";
        state.cityError = action.payload || action.error.message;
      })

      // ── Fetch All (public) ──
      .addCase(fetchProperties.pending, (state) => {
        state.fetchStatus.all = "loading";
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.fetchStatus.all = "succeeded";
        state.properties = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.fetchStatus.all = "failed";
        state.error = action.payload || action.error.message;
      })

      // ── Fetch Single ──
      .addCase(fetchPropertyById.pending, (state) => {
        state.fetchStatus.single = "loading";
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.fetchStatus.single = "succeeded";
        state.selectedProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.fetchStatus.single = "failed";
        state.selectedProperty = null;
        state.error = action.payload || action.error.message;
      })

      // ── Search / Filter ──
      .addCase(searchPropertiesAsync.pending, (state) => {
        state.fetchStatus.search = "loading";
        state.error = null;
      })
      .addCase(searchPropertiesAsync.fulfilled, (state, action) => {
        state.fetchStatus.search = "succeeded";
        state.properties = action.payload.content;
        state.pagination = extractPagination(action.payload);
      })
      .addCase(searchPropertiesAsync.rejected, (state, action) => {
        state.fetchStatus.search = "failed";
        state.error = action.payload || action.error.message;
      })

      // ── Fetch My Properties (HOST) ──
      .addCase(fetchMyProperties.pending, (state) => {
        state.fetchStatus.mine = "loading";
        state.error = null;
      })
     .addCase(fetchMyProperties.fulfilled, (state, action) => {
  state.fetchStatus.mine = "succeeded";

  state.myProperties = action.payload.filter(
    (property) => !property.deleted
  );
})
      .addCase(fetchMyProperties.rejected, (state, action) => {
        state.fetchStatus.mine = "failed";
        state.error = action.payload || action.error.message;
      })

      // ── Fetch Admin Properties ──
      .addCase(fetchAdminProperties.pending, (state) => {
        state.fetchStatus.admin = "loading";
        state.error = null;
      })
      .addCase(fetchAdminProperties.fulfilled, (state, action) => {
        state.fetchStatus.admin = "succeeded";
        state.adminProperties = action.payload.content;
        state.adminPagination = extractPagination(action.payload);
      })
      .addCase(fetchAdminProperties.rejected, (state, action) => {
        state.fetchStatus.admin = "failed";
        state.error = action.payload || action.error.message;
      })

      // ── Availability ──
      .addCase(fetchPropertyAvailability.pending, (state) => {
        state.fetchStatus.availability = "loading";
        state.error = null;
      })
      .addCase(fetchPropertyAvailability.fulfilled, (state, action) => {
        state.fetchStatus.availability = "succeeded";
        state.availability = action.payload;
      })
      .addCase(fetchPropertyAvailability.rejected, (state, action) => {
        state.fetchStatus.availability = "failed";
        state.availability = [];
        state.error = action.payload || action.error.message;
      })

      // ── Create Property ──
      .addCase(createPropertyAsync.pending, (state) => {
        state.mutationStatus.create = "loading";
        state.mutationError.create = null;
      })
      .addCase(createPropertyAsync.fulfilled, (state, action) => {
        state.mutationStatus.create = "succeeded";
        state.properties.unshift(action.payload);
        state.myProperties.unshift(action.payload);
      })
      .addCase(createPropertyAsync.rejected, (state, action) => {
        state.mutationStatus.create = "failed";
        state.mutationError.create = action.payload || action.error.message;
      })

      // ── Update Property ──
      .addCase(updatePropertyAsync.pending, (state) => {
        state.mutationStatus.update = "loading";
        state.mutationError.update = null;
      })
      .addCase(updatePropertyAsync.fulfilled, (state, action) => {
        state.mutationStatus.update = "succeeded";
        const updated = action.payload;

        syncUpdatedProperty(state.properties, updated);
        syncUpdatedProperty(state.myProperties, updated);
        syncUpdatedProperty(state.adminProperties, updated);

        if (state.selectedProperty?.id === updated.id) {
          state.selectedProperty = updated;
        }
      })
      .addCase(updatePropertyAsync.rejected, (state, action) => {
        state.mutationStatus.update = "failed";
        state.mutationError.update = action.payload || action.error.message;
      })

      // ── Delete Property (soft delete) ──
      .addCase(deletePropertyAsync.pending, (state) => {
        state.mutationStatus.delete = "loading";
        state.mutationError.delete = null;
      })
      .addCase(deletePropertyAsync.fulfilled, (state, action) => {
        state.mutationStatus.delete = "succeeded";
        const deletedId = action.payload;

        state.properties = state.properties.filter(
          (p) => p.id !== deletedId,
        );
        state.myProperties = state.myProperties.filter(
          (p) => p.id !== deletedId,
        );

        const adminIdx = state.adminProperties.findIndex(
          (p) => p.id === deletedId,
        );
        if (adminIdx !== -1) {
          state.adminProperties[adminIdx].deleted = true;
          state.adminProperties[adminIdx].status = PROPERTY_STATUS.UNAVAILABLE;
        }

        if (state.selectedProperty?.id === deletedId) {
          state.selectedProperty = null;
        }
      })
      .addCase(deletePropertyAsync.rejected, (state, action) => {
        state.mutationStatus.delete = "failed";
        state.mutationError.delete = action.payload || action.error.message;
      })

      // ── Upload Images ──
      .addCase(uploadPropertyImagesAsync.pending, (state) => {
        state.mutationStatus.uploadImages = "loading";
        state.mutationError.uploadImages = null;
      })
      .addCase(uploadPropertyImagesAsync.fulfilled, (state, action) => {
        state.mutationStatus.uploadImages = "succeeded";
        const updated = action.payload;

        if (state.selectedProperty?.id === updated.id) {
          state.selectedProperty = updated;
        }

        syncUpdatedProperty(state.properties, updated);
        syncUpdatedProperty(state.myProperties, updated);
        syncUpdatedProperty(state.adminProperties, updated);
      })
      .addCase(uploadPropertyImagesAsync.rejected, (state, action) => {
        state.mutationStatus.uploadImages = "failed";
        state.mutationError.uploadImages =
          action.payload || action.error.message;
      })

      // ── Delete Property Image ──
      .addCase(deletePropertyImageAsync.pending, (state) => {
        state.mutationStatus.deleteImage = "loading";
        state.mutationError.deleteImage = null;
      })
      .addCase(deletePropertyImageAsync.fulfilled, (state, action) => {
        state.mutationStatus.deleteImage = "succeeded";
        const { propertyId, imageId } = action.payload;

        if (state.selectedProperty?.id === propertyId) {
          state.selectedProperty.images = removeImageById(
            state.selectedProperty.images,
            imageId,
          );
        }

        const syncImages = (list) => {
          const idx = list.findIndex((p) => p.id === propertyId);
          if (idx !== -1 && list[idx].images) {
            list[idx].images = removeImageById(list[idx].images, imageId);
          }
        };

        syncImages(state.properties);
        syncImages(state.myProperties);
        syncImages(state.adminProperties);
      })
      .addCase(deletePropertyImageAsync.rejected, (state, action) => {
        state.mutationStatus.deleteImage = "failed";
        state.mutationError.deleteImage =
          action.payload || action.error.message;
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────

export const {
  clearSelectedProperty,
  clearAvailability,
  clearPropertyErrors,
  resetPropertyState,
} = propertySlice.actions;

// ─── Selectors ────────────────────────────────────────────────

export const selectAllProperties = (state) => state.properties.properties;

export const selectAllCities = (state) => state.properties.cities;
export const selectCityStatus = (state) => state.properties.cityStatus;
export const selectCityError = (state) => state.properties.cityError;

export const selectMyProperties = (state) => state.properties.myProperties;
export const selectAdminProperties = (state) =>
  state.properties.adminProperties;
export const selectSelectedProperty = (state) =>
  state.properties.selectedProperty;
export const selectAvailability = (state) => state.properties.availability;

// Select a single property by ID across all lists
export const selectPropertyById = (state, id) => {
  if (id == null) return null;
  const numId = Number(id);

  if (state.properties.selectedProperty?.id === numId) {
    return state.properties.selectedProperty;
  }

  return (
    state.properties.properties.find((p) => p.id === numId) ??
    state.properties.myProperties.find((p) => p.id === numId) ??
    state.properties.adminProperties.find((p) => p.id === numId) ??
    null
  );
};

export const selectPagination = (state) => state.properties.pagination;
export const selectAdminPagination = (state) =>
  state.properties.adminPagination;
export const selectTotalPages = (state) =>
  state.properties.pagination.totalPages;
export const selectCurrentPage = (state) => state.properties.pagination.page;
export const selectTotalElements = (state) =>
  state.properties.pagination.totalElements;

export const selectPropertyFetchStatus = (state) =>
  state.properties.fetchStatus;

export const selectIsFetchingProperties = (state) =>
  state.properties.fetchStatus.all === "loading";
export const selectIsFetchingProperty = (state) =>
  state.properties.fetchStatus.single === "loading";
export const selectIsSearchingProperties = (state) =>
  state.properties.fetchStatus.search === "loading";
export const selectIsFetchingMyProperties = (state) =>
  state.properties.fetchStatus.mine === "loading";
export const selectIsFetchingAdminProperties = (state) =>
  state.properties.fetchStatus.admin === "loading";
export const selectIsFetchingAvailability = (state) =>
  state.properties.fetchStatus.availability === "loading";

export const selectMutationStatus = (state) =>
  state.properties.mutationStatus;
export const selectMutationError = (state) => state.properties.mutationError;

export const selectIsCreatingProperty = (state) =>
  state.properties.mutationStatus.create === "loading";
export const selectIsUpdatingProperty = (state) =>
  state.properties.mutationStatus.update === "loading";
export const selectIsDeletingProperty = (state) =>
  state.properties.mutationStatus.delete === "loading";
export const selectIsUploadingImages = (state) =>
  state.properties.mutationStatus.uploadImages === "loading";
export const selectIsDeletingImage = (state) =>
  state.properties.mutationStatus.deleteImage === "loading";

export const selectPropertyError = (state) => state.properties.error;

export const selectPropertyStatus = (state) => state.properties.fetchStatus;

export default propertySlice.reducer;