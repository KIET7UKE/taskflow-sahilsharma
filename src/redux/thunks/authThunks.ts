import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@/apis/auth";
import { setAuthenticationSlice } from "@/redux/slices/auth/authSlice";

/**
 * Login Thunk.
 * Handles the user login process, including API call, updating state, and localStorage.
 */
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: Parameters<typeof authApi.login>[0], { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.login(data);
      dispatch(
        setAuthenticationSlice({
          isAuthenticated: true,
          token: response.token,
          userDetails: response.user,
        })
      );
      localStorage.setItem("token", response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Register Thunk.
 * Handles the user registration process, including API call and auto-login on success.
 */
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: Parameters<typeof authApi.register>[0], { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.register(data);
      dispatch(
        setAuthenticationSlice({
          isAuthenticated: true,
          token: response.token,
          userDetails: response.user,
        })
      );
      localStorage.setItem("token", response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
