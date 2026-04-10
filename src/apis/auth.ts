import { postAPI } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserDetails {
  id: string;
  name: string;
  email: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    postAPI<AuthResponse>("/api/auth/login", data),

  register: (data: RegisterRequest) =>
    postAPI<AuthResponse>("/api/auth/register", data),
};
