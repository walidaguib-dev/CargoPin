// Mirrors Backend/Domain/Enums/AreaStatus.cs exactly.
export const AREA_STATUSES = ["Available", "Occupied", "Blocked"] as const;

export type AreaStatus = (typeof AREA_STATUSES)[number];

export const AREA_STATUS_LABELS: Record<AreaStatus, string> = {
  Available: "Available",
  Occupied: "Occupied",
  Blocked: "Blocked",
};

// Read-only — areas are created/edited/deleted exclusively on the Map page (which
// draws/edits the Boundary polygon), so there's no CreateAreaDto/UpdateAreaDto or
// zod schema here, unlike every other entity module in this codebase.
export interface Area {
  id: number;
  name: string;
  code: string;
  status: AreaStatus;
  zoneId: number;
  zoneName: string;
}
