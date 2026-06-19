export interface Attraction {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface CityRoute {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  attractions: Attraction[];
}

export interface RouteResponse {
  cities: CityRoute[];
  totalDistance: number;
  totalTime: number;
}

export interface CalculateRouteRequest {
  startCityId: number;
  endCityId: number;
  criteria: "distance" | "time";
}
