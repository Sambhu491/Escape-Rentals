import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  registerUser as registerUserApi,
  loginUser as loginUserApi,
} from "../../api/authApi";

import { deleteMyAccount } from "../user/userSlice";


// Helpers

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message;

// Persist auth to localStorage for session rehydration
const persistAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("authUser", JSON.stringify(user));
};

const persistPendingRegistration = (data) => {
  localStorage.setItem("pendingRegistration", JSON.stringify(data));
};

const clearPersistedAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("authUser");
};

const clearPendingRegistration = () => {
  localStorage.removeItem("pendingRegistration");
};

const clearAuthState = (state) => {
  state.user = null;
  state.token = null;
  state.isAuthenticated = false;
  state.emailVerified = false;

  state.pendingRegistration = null;

  state.status.register = "idle";
  state.status.login = "idle";

  state.error.register = null;
  state.error.login = null;

  clearPersistedAuth();
  clearPendingRegistration();
};

// Async Thunks

// POST /auth/register
// Request:  { firstName, lastName, email, phone, password, role? }
// Response: AuthResponse { token, id, firstName, lastName, email, phone, role }
// NOTE: After register, emailVerified = false — backend sends OTP automatically.
//       Navigate user to OTP verification page after success.
export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const response = await registerUserApi(data);
      if (!response?.email) {
        return thunkAPI.rejectWithValue("Registration failed");
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// POST /auth/login
// Request:  { email, password }
// Response: AuthResponse { token, id, firstName, lastName, email, phone, role }
// NOTE: Backend throws EmailNotVerifiedException if email not yet verified.
//       If login succeeds, emailVerified is guaranteed to be true.
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const response = await loginUserApi(data);

      if (!response?.token) {
        return thunkAPI.rejectWithValue("Login failed");
      }

      persistAuth(response.token, {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        phone: response.phone,
        role: response.role,
      });

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  },
);

// Initial State

// Rehydrate from localStorage on app startup
const rehydrateUser = () => {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const rehydratePendingRegistration = () => {
  try {
    const raw = localStorage.getItem("pendingRegistration");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const rehydratedPendingRegistration = rehydratePendingRegistration();

const rehydratedUser = rehydrateUser();
const rehydratedToken = localStorage.getItem("token");

const initialState = {
  // Authenticated user info from AuthResponse
  user: rehydratedUser,

  pendingRegistration: rehydratedPendingRegistration,

  // JWT token
  token: rehydratedToken || null,

  // Derived: true only when token + user exist in state
  isAuthenticated: !!(rehydratedToken && rehydratedUser),

  // Tracks email verification status:
  // - false after register (OTP not yet confirmed)
  // - true after login (backend enforces emailVerified check)
  // - true after verifyOtp (set via setEmailVerified action below)
  emailVerified: false,

  // Granular status per action
  status: {
    register: "idle",
    login: "idle",
  },

  // Granular errors per action
  error: {
    register: null,
    login: null,
  },
};

// Slice

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // Call this after verifyOtp succeeds — syncs authData from otpSlice into authSlice
    // Dispatch: setAuthFromOtp(otpAuthData) where otpAuthData = selectOtpAuthData(state)
   setAuthFromOtp:(state,action)=>{

const data=action.payload;

const user={
 id:data.id,
 firstName:data.firstName,
 lastName:data.lastName,
 email:data.email,
 phone:data.phone,
 role:data.role
};

state.user=user;
state.token=data.token;
state.isAuthenticated=true;
state.emailVerified=true;

localStorage.setItem(
 "token",
 data.token
);

localStorage.setItem(
 "authUser",
 JSON.stringify(user)
);

state.pendingRegistration=null;

clearPendingRegistration();
},

    // Mark email as verified after OTP confirm
    setEmailVerified: (state) => {
      state.emailVerified = true;
    },

    // Update user profile in auth state (call after updateCurrentUser succeeds)
    updateAuthUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("authUser", JSON.stringify(state.user));
      }
    },

    // Logout — clears all auth state and localStorage
logout: (state) => {
  clearAuthState(state);
},

    clearAuthErrors: (state) => {
      state.error.register = null;
      state.error.login = null;
    },

    resetRegisterStatus:(state)=>{
    state.status.register="idle";
    state.error.register=null;
},

  },

  extraReducers: (builder) => {
    builder
 .addCase(deleteMyAccount.fulfilled, (state) => {
      clearAuthState(state);
    })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
  state.status.register = "loading";
  state.error.register = null;
})
      .addCase(registerUser.fulfilled, (state, action) => {
        const pending = {
          email: action.payload.email,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
        };

        state.pendingRegistration = pending;

        persistPendingRegistration(pending);

        state.token = null;
        state.isAuthenticated = false;
        state.emailVerified = false;

        state.status.register = "succeeded";
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.status.register = "failed";
        state.error.register = action.payload || action.error.message;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.status.login = "loading";
        state.error.login = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status.login = "succeeded";

        state.user = {
          id: action.payload.id,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          phone: action.payload.phone,
          role: action.payload.role,
        };
        state.token = action.payload.token;
        state.isAuthenticated = true;

        // login only succeeds on backend if emailVerified = true
        state.emailVerified = true;
        state.pendingRegistration = null;
        clearPendingRegistration();

      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status.login = "failed";
        state.error.login = action.payload || action.error.message;
      });
  },
});

// Actions

export const {
  setAuthFromOtp,
  setEmailVerified,
  updateAuthUser,
  logout,
  clearAuthErrors,
  resetRegisterStatus,
} = authSlice.actions;

// Selectors

// User & session
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectEmailVerified = (state) => state.auth.emailVerified;

// Derived role selectors — avoids string comparisons in components
export const selectIsUser = (state) => state.auth.user?.role === "ROLE_USER";
export const selectIsHost = (state) => state.auth.user?.role === "ROLE_HOST";
export const selectIsAdmin = (state) => state.auth.user?.role === "ROLE_ADMIN";
export const selectCurrentUserId = (state) => state.auth.user?.id ?? null;

// Status
export const selectAuthStatus = (state) => state.auth.status;

export const selectIsRegistering = (state) =>
  state.auth.status.register === "loading";

export const selectIsLoggingIn = (state) =>
  state.auth.status.login === "loading";

export const selectRegisterSucceeded = (state) =>
  state.auth.status.register === "succeeded";

export const selectLoginSucceeded = (state) =>
  state.auth.status.login === "succeeded";

// Errors
export const selectAuthError = (state) => state.auth.error;
export const selectRegisterError = (state) => state.auth.error.register;
export const selectLoginError = (state) => state.auth.error.login;

export default authSlice.reducer;
