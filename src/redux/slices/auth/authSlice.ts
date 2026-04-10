import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthenticationState } from "./types";

const AUTH_STORAGE_KEY = "authState";

// Helper functions for localStorage
const loadAuthFromStorage = (): Partial<AuthenticationState> => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
  }
  return {};
};

const saveAuthToStorage = (state: AuthenticationState): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving auth state to localStorage:", error);
  }
};

const clearAuthFromStorage = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing auth state from localStorage:", error);
  }
};

// Initialize state from localStorage if available
const storedAuth = loadAuthFromStorage();
const initialState: AuthenticationState = {
  isAuthenticated: storedAuth.isAuthenticated ?? false,
  token: storedAuth.token ?? null,
  userType: storedAuth.userType ?? null,
  userDetails: storedAuth.userDetails ?? null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticationSlice: (
      state,
      action: PayloadAction<Partial<AuthenticationState>>,
    ) => {
      const updatedState = {
        ...state,
        ...action.payload,
      };
      saveAuthToStorage(updatedState);
      return updatedState;
    },
    logout: () => {
      const clearedState: AuthenticationState = {
        isAuthenticated: false,
        token: null,
        userType: null,
        userDetails: null,
      };
      localStorage.removeItem("token");
      clearAuthFromStorage();
      return clearedState;
    },
    initializeAuthenticationState: (state) => {
      const stored = loadAuthFromStorage();
      if (Object.keys(stored).length > 0) {
        return {
          ...state,
          ...stored,
        };
      }
      return state;
    },
  },
});

export const { setAuthenticationSlice, logout, initializeAuthenticationState } =
  authSlice.actions;

export default authSlice.reducer;
