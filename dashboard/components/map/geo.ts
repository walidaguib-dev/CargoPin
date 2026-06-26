import type { GeoJsonFeature } from "@/lib/map/geojson-types";

// GeoJSON ordering is [lng, lat]; Leaflet wants [lat, lng]. Takes the outer ring
// only (index 0) — none of this app's polygons have holes.
export function polygonToLatLngs(
  feature: GeoJsonFeature<unknown>,
): [number, number][] {
  if (feature.geometry.type !== "Polygon") return [];
  const ring = feature.geometry.coordinates[0] ?? [];
  return ring.map(([lng, lat]) => [lat, lng]);
}

export function pointToLatLng(feature: GeoJsonFeature<unknown>): [number, number] {
  if (feature.geometry.type !== "Point") return [0, 0];
  const [lng, lat] = feature.geometry.coordinates;
  return [lat, lng];
}
