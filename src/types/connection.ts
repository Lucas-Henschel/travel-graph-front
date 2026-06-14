export interface ConnectionResponse {
  id: number;
  originCityId: number;
  destinationCityId: number;
  originCityName: string;
  destinationCityName: string;
  distance: number;
  time: number;
  createdAt: string;
}

export interface CreateConnectionRequest {
  originCityId: number;
  destinationCityId: number;
  distance: number;
  time: number;
}
