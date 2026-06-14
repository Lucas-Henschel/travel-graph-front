import api, { extractErrorMessage } from "./api";
import type { LoginCredentials, LoginResponse } from "@/types/auth";
import type { ServiceResult } from "@/types/api";

export const authService = {
  async login(
    credentials: LoginCredentials,
  ): Promise<ServiceResult<LoginResponse>> {
    try {
      const { data } = await api.post<LoginResponse>(
        "/auth/login",
        credentials,
      );

      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async logout(): Promise<{ data: boolean; error: string | null }> {
    try {
      await api.post("/auth/logout");

      return { data: true, error: null };
    } catch (err) {
      return { data: false, error: extractErrorMessage(err) };
    }
  },
};
