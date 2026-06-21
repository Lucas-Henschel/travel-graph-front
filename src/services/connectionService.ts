import api, { extractErrorMessage } from "./api";
import type { ServiceResult } from "@/types/api";
import type {
  ConnectionResponse,
  CreateConnectionRequest,
  UpdateConnectionRequest,
} from "@/types/connection";

export const connectionService = {
  async findAll(): Promise<ServiceResult<ConnectionResponse[]>> {
    try {
      const { data } = await api.get<ConnectionResponse[]>("/connections");
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async findById(id: string): Promise<ServiceResult<ConnectionResponse>> {
    try {
      const { data } = await api.get<ConnectionResponse>(`/connections/${id}`);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async create(
    payload: CreateConnectionRequest,
  ): Promise<ServiceResult<ConnectionResponse>> {
    try {
      const { data } = await api.post<ConnectionResponse>(
        "/connections",
        payload,
      );
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async update(
    id: string,
    payload: UpdateConnectionRequest,
  ): Promise<ServiceResult<ConnectionResponse>> {
    try {
      const { data } = await api.put<ConnectionResponse>(
        `/connections/${id}`,
        payload,
      );
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async remove(id: string): Promise<ServiceResult<void>> {
    try {
      await api.delete(`/connections/${id}`);
      return { data: undefined as void, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },
};
