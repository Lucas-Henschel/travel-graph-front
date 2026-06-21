export interface Attraction {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface CityRoute {
  id: string;
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
  startCityId: string;
  endCityId: string;
  criteria: "distance" | "time";
}
