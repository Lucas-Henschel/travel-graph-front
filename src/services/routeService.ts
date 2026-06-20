import api, { extractErrorMessage } from "./api";
import type { ServiceResult } from "@/types/api";
import type { CityResponse } from "@/types/city";
import type {
  RouteResponse,
  CalculateRouteRequest,
} from "@/types/route";

export const routeService = {
  async listCities(): Promise<ServiceResult<CityResponse[]>> {
    try {
      const { data } = await api.get<CityResponse[]>("/cities");
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },

  async calculateRoute(
    startCityId: string,
    endCityId: string,
    criteria: "distance" | "time",
  ): Promise<ServiceResult<RouteResponse>> {
    try {
      const payload: CalculateRouteRequest = {
        startCityId,
        endCityId,
        criteria,
      };
      const { data } = await api.post<RouteResponse>("/routes", payload);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: extractErrorMessage(err) };
    }
  },
};
