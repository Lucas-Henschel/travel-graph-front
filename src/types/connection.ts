export interface ConnectionResponse {
  id: string;
  originCityId: string;
  destinationCityId: string;
  originCityName: string;
  destinationCityName: string;
  distance: number;
  /** Duration in decimal hours (e.g. 1.5 = 1h30min). */
  time: number;
  createdAt: string;
}

export interface CreateConnectionRequest {
  originCityId: string;
  destinationCityId: string;
  distance: number;
  /** Duration in decimal hours (e.g. 1.5 = 1h30min). */
  time: number;
}

export interface UpdateConnectionRequest {
  originCityId: string;
  destinationCityId: string;
  distance: number;
  /** Duration in decimal hours (e.g. 1.5 = 1h30min). */
  time: number;
}
