import api, { extractErrorMessage } from "./api";
import type { ServiceResult } from "@/types/api";
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/user";

export const userService = {
  async findAll(): Promise<ServiceResult<UserResponse[]>> {
    try {
      const { data } = await api.get<UserResponse[]>("/user");
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async findById(id: string): Promise<ServiceResult<UserResponse>> {
    try {
      const { data } = await api.get<UserResponse>(`/user/${id}`);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async create(
    payload: CreateUserRequest,
  ): Promise<ServiceResult<UserResponse>> {
    try {
      const { data } = await api.post<UserResponse>("/user", payload);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async update(
    id: string,
    payload: UpdateUserRequest,
  ): Promise<ServiceResult<UserResponse>> {
    try {
      const { data } = await api.put<UserResponse>(`/user/${id}`, payload);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async remove(id: string): Promise<ServiceResult<void>> {
    try {
      await api.delete(`/user/${id}`);
      return { data: undefined as void, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },
};
