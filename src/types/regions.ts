
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface Region {
  id: number;
  name: string;
  type: string;
  country: string;
  state: string | null;
  continent: string | null;
  coordinates: string | null;
  created_at: string;
  parent_id: number | null;
  population: number | null;
}

export interface DatabaseRegion extends Omit<Region, 'state'> {
  state?: string | null;
}

