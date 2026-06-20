import api, { extractErrorMessage } from "./api";
import type { ServiceResult } from "@/types/api";
import type {
  AttractionResponse,
  CreateAttractionRequest,
  UpdateAttractionRequest,
} from "@/types/attraction";

export const attractionService = {
  async findAll(): Promise<ServiceResult<AttractionResponse[]>> {
    try {
      const { data } = await api.get<AttractionResponse[]>("/attractions");
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async findById(id: string): Promise<ServiceResult<AttractionResponse>> {
    try {
      const { data } = await api.get<AttractionResponse>(`/attractions/${id}`);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async create(
    payload: CreateAttractionRequest,
  ): Promise<ServiceResult<AttractionResponse>> {
    try {
      const { data } = await api.post<AttractionResponse>(
        "/attractions",
        payload,
      );
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async update(
    id: string,
    payload: UpdateAttractionRequest,
  ): Promise<ServiceResult<AttractionResponse>> {
    try {
      const { data } = await api.put<AttractionResponse>(
        `/attractions/${id}`,
        payload,
      );
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async remove(id: string): Promise<ServiceResult<void>> {
    try {
      await api.delete(`/attractions/${id}`);
      return { data: undefined as void, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },
};
