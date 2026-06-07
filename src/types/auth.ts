export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export type AuthStatus = "anonymous" | "loading" | "authenticated" | "error";
