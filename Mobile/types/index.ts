export interface Vessel {
  id: number;
  name: string;
  imoNumber?: string;
}

export interface Merchandise {
  id: number;
  description: string;
  cargoType: string;
}

export interface Client {
  id: number;
  name: string;
}

export interface Shipment {
  id: number;
  blNumbers: string[];
  arrivalDate: string;
  status: string;
  client: Client;
  vessel: Vessel;
  merchandise: Merchandise;
}

export interface Position {
  id: number;
  latitude: number;
  longitude: number;
  placedAt: string;
  isEmergencyPlacement: boolean;
  isActive: boolean;
  state: string;
  notes?: string;
  areaName?: string;
  zoneName?: string;
  shipment: Shipment;
}

export interface NearbyPosition {
  id: number;
  clientName: string;
  merchandiseDescription: string;
  vesselName: string;
  latitude: number;
  longitude: number;
  placedAt: string;
  notes?: string;
  isEmergencyPlacement: boolean;
  areaName?: string;
  zoneName?: string;
}
