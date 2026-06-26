import type {
  AreaGeoJsonProperties,
  GeoJsonFeatureCollection,
  PositionGeoJsonProperties,
  ZoneGeoJsonProperties,
} from "./geojson-types";

// Backend/API/Routes/{Zones,Areas,MerchandiseAreaPositions}Endpoints.cs all mount
// under app.MapGroup("/api/<entity>") — these three "geojson" GET routes have no
// .RequireAuthorization(), unlike every create/update/delete route below.
const API_BASE = process.env.NEXT_PUBLIC_API_URI ?? "";

// Same /graphql derivation every other lib/<entity>/graphql.ts in this codebase
// uses — needed here only for the two single-record lookups below.
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URI ?? `${API_BASE.replace(/\/api\/?$/, "")}/graphql`;

export interface ApiFieldError {
  field: string;
  message: string;
}

// Thrown when the backend's global exception handler returns a FluentValidation
// failure shaped as `{ errors: [{ field, message }] }` (see
// Backend/API/middlewares/ExceptionsHandler.cs).
export class ApiValidationError extends Error {
  fieldErrors: ApiFieldError[];

  constructor(fieldErrors: ApiFieldError[]) {
    super("Validation failed");
    this.name = "ApiValidationError";
    this.fieldErrors = fieldErrors;
  }
}

function authHeaders(accessToken: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
}

async function throwOnError(res: Response): Promise<never> {
  if (res.status === 400) {
    const body = await res.json().catch(() => null);
    if (body?.errors) {
      throw new ApiValidationError(body.errors as ApiFieldError[]);
    }
  }
  throw new Error(`Request failed with status ${res.status}`);
}

export async function fetchZonesGeoJson(): Promise<
  GeoJsonFeatureCollection<ZoneGeoJsonProperties>
> {
  const res = await fetch(`${API_BASE}/zones/geojson`);
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export async function fetchAreasGeoJson(): Promise<
  GeoJsonFeatureCollection<AreaGeoJsonProperties>
> {
  const res = await fetch(`${API_BASE}/areas/geojson`);
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export async function fetchPositionsGeoJson(): Promise<
  GeoJsonFeatureCollection<PositionGeoJsonProperties>
> {
  const res = await fetch(`${API_BASE}/positions/geojson`);
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

// Backend/Domain/Helpers/BoundaryCoordinate.cs is `{ Latitude, Longitude }` objects,
// NOT [lat, lng] tuples — converts the array of tuples produced from the drawn
// Leaflet layer into the shape CreateZoneDto/CreateAreaDto.Boundary actually expects.
export function toBoundaryCoordinates(
  latLngs: [number, number][],
): { latitude: number; longitude: number }[] {
  return latLngs.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
}

// Matches Backend/Application/Zones/Dtos/CreateZoneDto.cs exactly. UpdateZoneDto is
// the same shape (UpdateZoneDto : CreateZoneDto {}) — Boundary/DesignatedMerchandiseId
// are optional there in practice (ZonesRepository.UpdateAsync only applies Boundary
// "if request.Boundary != null && request.Boundary.Any()").
export interface ZoneDto {
  name: string;
  code: string;
  type: string; // "Hangar" | "Quay" — see CreateZoneValidator, NOT the task's made-up list
  notes: string | null;
  isActive: boolean;
  boundary?: { latitude: number; longitude: number }[];
  designatedMerchandiseId: number | null;
}

// Matches Backend/Application/Areas/Dtos/CreateAreaDto.cs exactly.
export interface AreaDto {
  name: string;
  code: string;
  status: string; // "Available" | "Occupied" | "Blocked"
  notes: string | null;
  isActive: boolean;
  zoneId: number;
  designatedMerchandiseId: number;
  boundary?: { latitude: number; longitude: number }[];
}

export async function createZone(dto: ZoneDto, accessToken: string | null): Promise<void> {
  const res = await fetch(`${API_BASE}/zones/create`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(dto),
  });
  if (!res.ok) await throwOnError(res);
}

export async function updateZone(
  id: number,
  dto: ZoneDto,
  accessToken: string | null,
): Promise<void> {
  const res = await fetch(`${API_BASE}/zones/update/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(dto),
  });
  if (!res.ok) await throwOnError(res);
}

export async function deleteZone(id: number, accessToken: string | null): Promise<void> {
  const res = await fetch(`${API_BASE}/zones/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
  if (!res.ok) await throwOnError(res);
}

export async function createArea(dto: AreaDto, accessToken: string | null): Promise<void> {
  const res = await fetch(`${API_BASE}/areas/create`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(dto),
  });
  if (!res.ok) await throwOnError(res);
}

export async function updateArea(
  id: number,
  dto: AreaDto,
  accessToken: string | null,
): Promise<void> {
  const res = await fetch(`${API_BASE}/areas/update/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(dto),
  });
  if (!res.ok) await throwOnError(res);
}

export async function deleteArea(id: number, accessToken: string | null): Promise<void> {
  const res = await fetch(`${API_BASE}/areas/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
  if (!res.ok) await throwOnError(res);
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function fetchGraphQL<TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed with status ${res.status}`);
  const json: GraphQLResponse<TData> = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as TData;
}

export interface ZoneDetails {
  id: number;
  name: string;
  code: string;
  type: string;
  notes: string | null;
  isActive: boolean;
  designatedMerchandiseId: number | null;
}

const ZONE_DETAILS_QUERY = /* GraphQL */ `
  query GetZone($id: Int!) {
    zone(id: $id) {
      id
      name
      code
      type
      notes
      isActive
      designatedMerchandiseId
    }
  }
`;

// The map's zone popup only carries {id, name, code, type} (ZoneGeoJsonProperties).
// Editing needs notes/isActive/designatedMerchandiseId too, and — critically —
// designatedMerchandiseId must round-trip unchanged on submit: ZonesRepository.
// UpdateAsync assigns it unconditionally, so silently omitting it would null out a
// Hangar zone's merchandise assignment.
export async function fetchZoneDetails(id: number): Promise<ZoneDetails | null> {
  const data = await fetchGraphQL<{ zone: ZoneDetails | null }>(ZONE_DETAILS_QUERY, { id });
  return data.zone;
}

export interface AreaDetails {
  id: number;
  name: string;
  code: string;
  status: string;
  notes: string | null;
  isActive: boolean;
  zoneId: number;
  designatedMerchandiseId: number;
}

const AREA_DETAILS_QUERY = /* GraphQL */ `
  query GetArea($id: Int!) {
    area(id: $id) {
      id
      name
      code
      status
      notes
      isActive
      zoneId
      designatedMerchandiseId
    }
  }
`;

// Same reasoning as fetchZoneDetails — AreasRepository.UpdateAsync assigns
// DesignatedMerchandiseId unconditionally (non-nullable int), so sending 0 would
// point the area at a non-existent merchandise and throw an FK violation in
// SaveChangesAsync.
export async function fetchAreaDetails(id: number): Promise<AreaDetails | null> {
  const data = await fetchGraphQL<{ area: AreaDetails | null }>(AREA_DETAILS_QUERY, { id });
  return data.area;
}
