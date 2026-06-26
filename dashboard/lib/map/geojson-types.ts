// Mirrors Backend/Domain/GeoJson/*.cs exactly. These three REST endpoints
// (GET /api/zones/geojson, /api/areas/geojson, /api/positions/geojson) are plain
// Minimal API `Results.Ok(...)` responses — NOT routed through HotChocolate/GraphQL
// — so enum fields are plain C# `.ToString()` output (PascalCase, e.g. "Hangar",
// "Available"), unlike the SCREAMING_SNAKE_CASE convention used by every GraphQL
// list query elsewhere in this app. Do not reuse the toGraphQLEnum/fromGraphQLEnum
// helpers from lib/zones or lib/areas graphql.ts here — they'd be wrong for this
// wire format. The plain string-union types (ZoneType/AreaStatus) from those
// modules are still reusable as-is, since they were already modeled on the literal
// C# enum spelling.

export interface GeoJsonFeature<TProperties> {
  type: "Feature";
  geometry: GeoJsonPointGeometry | GeoJsonPolygonGeometry;
  properties: TProperties;
}

export interface GeoJsonFeatureCollection<TProperties> {
  type: "FeatureCollection";
  features: GeoJsonFeature<TProperties>[];
}

export interface GeoJsonPointGeometry {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoJsonPolygonGeometry {
  type: "Polygon";
  coordinates: number[][][]; // rings of [lng, lat]
}

// Domain/GeoJson/ZoneGeoJsonProperties.cs
export interface ZoneGeoJsonProperties {
  id: number;
  name: string;
  code: string;
  type: string; // "Hangar" | "Quay"
}

// Domain/GeoJson/AreaGeoJsonProperties.cs
export interface AreaGeoJsonProperties {
  id: number;
  name: string;
  code: string;
  status: string; // "Available" | "Occupied" | "Blocked"
  zoneName: string;
  zoneId: number;
}

// Domain/GeoJson/PositionGeoJsonProperties.cs
export interface PositionGeoJsonProperties {
  id: number;
  clientName: string;
  merchandiseDescription: string;
  vesselName: string;
  areaName: string | null;
  zoneName: string | null;
  isEmergencyPlacement: boolean;
  placedAt: string;
  notes: string | null;
}
