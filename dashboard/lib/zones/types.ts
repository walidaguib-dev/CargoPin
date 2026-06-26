// Mirrors Backend/Domain/Enums/ZoneType.cs exactly.
export const ZONE_TYPES = ["Hangar", "Quay"] as const;

export type ZoneType = (typeof ZONE_TYPES)[number];

export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  Hangar: "Hangar",
  Quay: "Quay",
};

// Read-only — zones are created/edited/deleted exclusively on the Map page (which
// draws/edits the Boundary polygon), same as Areas — no Create/UpdateZoneDto or zod
// schema here, unlike every mutable entity module in this codebase.
export interface Zone {
  id: number;
  name: string;
  code: string;
  type: ZoneType;
  designatedMerchandiseDescription: string | null;
}
