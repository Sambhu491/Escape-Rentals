import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  deactivateCategory,
} from "../../api/categoryApi";


const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong";


export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (_, thunkAPI) => {
    try {
      const data = await getCategories();
      if (!Array.isArray(data)) {
        return thunkAPI.rejectWithValue("Invalid response from server");
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id, thunkAPI) => {
    try {
        if (!id || (typeof id !== "string" && !Number.isInteger(id))) {
            return thunkAPI.rejectWithValue("Invalid category ID");
        }
        const data = await getCategory(id);
        if (!data) {
            return thunkAPI.rejectWithValue("Category not found");
        }
        return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createCategoryAsync = createAsyncThunk(
  "categories/create",
  async (categoryData, thunkAPI) => {
    try {
        if (!categoryData) {
            return thunkAPI.rejectWithValue("Category data is required");
        }
        const data = await createCategory(categoryData);
        if (!data) {
            return thunkAPI.rejectWithValue("Failed to create category");
        }
        return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateCategoryAsync = createAsyncThunk(
  "categories/update",
  async ({ id, categoryData }, thunkAPI) => {
    try {
      if (!id || (typeof id !== "string" && !Number.isInteger(id))) {
        return thunkAPI.rejectWithValue("Invalid category ID");
      }

      if (!categoryData) {
        return thunkAPI.rejectWithValue("Category data is required");
      }

      const data = await updateCategory(id, categoryData);

      if (!data) {
        return thunkAPI.rejectWithValue("Failed to update category");
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteCategoryAsync = createAsyncThunk(
  "categories/delete",
  async (id, thunkAPI) => {
    try {
      if (!id || (typeof id !== "string" && !Number.isInteger(id))) {
         return thunkAPI.rejectWithValue("Invalid category ID");
      }
      await deleteCategory(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deactivateCategoryAsync = createAsyncThunk(
  "categories/deactivate",
  async (id, thunkAPI) => {
    try {
      if (!id || (typeof id !== "string" && !Number.isInteger(id))) {
        return thunkAPI.rejectWithValue("Invalid category ID");
      }

      await deactivateCategory(id);

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

const initialState = {
  categories: [],
  selectedCategory: null,
  status: "idle",
  error: null,
};

export const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchCategoryById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
        state.selectedCategory = null;
      })

      .addCase(createCategoryAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        const newCategory = action.payload;
        
        if (!newCategory) return;
        
        if (!state.categories.some(cat => cat.id === newCategory.id)) {
            state.categories.push(newCategory);
        }
      })
      .addCase(createCategoryAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(updateCategoryAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.categories.findIndex(
          (category) => category.id === action.payload.id,
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategoryAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(deleteCategoryAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.categories.findIndex(
          (category) => category.id === action.payload,
        );
        if (index !== -1) {
          state.categories.splice(index, 1);
        }
      })
      .addCase(deleteCategoryAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(deactivateCategoryAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deactivateCategoryAsync.fulfilled, (state, action) => {
        state.status = "succeeded";

        const category = state.categories.find((c) => c.id === action.payload);

        if (category) {
          category.active = false;
        }
      })
      .addCase(deactivateCategoryAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});


export const selectAllCategories = (state) =>
  state.categories.categories;

export const selectSelectedCategory = (state) =>
  state.categories.selectedCategory;

export const selectCategoryStatus = (state) =>
  state.categories.status;

export const selectCategoryError = (state) =>
  state.categories.error;

export default categorySlice.reducer;
