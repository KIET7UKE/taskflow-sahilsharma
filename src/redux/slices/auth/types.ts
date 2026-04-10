export interface UserDetails {
  id: string;
  name: string;
  email: string;
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  token?: string | null;
  userDetails?: UserDetails | null;
}
