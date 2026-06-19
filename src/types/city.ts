export interface CityResponse {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityRequest {
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface UpdateCityRequest {
  name: string;
  latitude: number | null;
  longitude: number | null;
}
