import { localStorageKeys } from "@/config/localStorageKeys";
import type { StandardError } from "@/types/api";
import axios, { type AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);
  if (accessToken) {
    config.headers!["token"] = accessToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(localStorageKeys.SESSION);
      localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(err: unknown): string {
  const axiosError = err as AxiosError<StandardError>;
  return axiosError.response?.data?.message ?? "Erro desconecido";
}

export default api;
