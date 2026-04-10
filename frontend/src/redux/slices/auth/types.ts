export type UserRole = "individual" | "organization";

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  userType: string;
  avatar?: string;
  isServiceProvider: boolean;
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  token?: string | null;
  userType?: UserRole | null;
  userDetails?: UserDetails | null;
}
