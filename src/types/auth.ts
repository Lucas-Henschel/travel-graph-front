export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  currentUser: AuthUser;
}

export type AuthStatus = "anonymous" | "loading" | "authenticated" | "error";
