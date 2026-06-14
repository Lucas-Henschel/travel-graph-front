import type { CityResponse } from "./city";

export interface AttractionResponse {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  city: CityResponse;
}

export interface CreateAttractionRequest {
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  cityId: number;
}

export interface UpdateAttractionRequest {
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
}

export const ATTRACTION_CATEGORIES = [
  "Museu",
  "Parque",
  "Praia",
  "Monumento",
  "Restaurante",
  "Igreja",
  "Mirante",
  "Centro Histórico",
  "Teatro",
  "Outro",
] as const;
