import api, { extractErrorMessage } from "./api";
import type { ServiceResult } from "@/types/api";
import type {
  CityResponse,
  CreateCityRequest,
  UpdateCityRequest,
} from "@/types/city";

export const cityService = {
  async findAll(): Promise<ServiceResult<CityResponse[]>> {
    try {
      const { data } = await api.get<CityResponse[]>("/cities");
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async findById(id: number): Promise<ServiceResult<CityResponse>> {
    try {
      const { data } = await api.get<CityResponse>(`/cities/${id}`);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async create(
    payload: CreateCityRequest,
  ): Promise<ServiceResult<CityResponse>> {
    try {
      const { data } = await api.post<CityResponse>("/cities", payload);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async update(
    id: number,
    payload: UpdateCityRequest,
  ): Promise<ServiceResult<CityResponse>> {
    try {
      const { data } = await api.put<CityResponse>(`/cities/${id}`, payload);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async remove(id: number): Promise<ServiceResult<void>> {
    try {
      await api.delete(`/cities/${id}`);
      return { data: undefined as void, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },
};
