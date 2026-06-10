import api from "./api";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  },
};
