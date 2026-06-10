import api from "./api";
import type { UserResponse, CreateUserRequest, UpdateUserRequest } from "@/types/user";

export const userService = {
  async findAll(): Promise<UserResponse[]> {
    const { data } = await api.get<UserResponse[]>("/user");
    return data;
  },

  async findById(id: string): Promise<UserResponse> {
    const { data } = await api.get<UserResponse>(`/user/${id}`);
    return data;
  },

  async create(payload: CreateUserRequest): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>("/user", payload);
    return data;
  },

  async update(id: string, payload: UpdateUserRequest): Promise<UserResponse> {
    const { data } = await api.put<UserResponse>(`/user/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/user/${id}`);
  },
};
