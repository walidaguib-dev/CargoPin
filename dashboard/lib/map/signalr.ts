// Backend/API/Program.cs mounts the hub at app.MapHub<PositionsHub>("/hubs/positions"),
// off the app root — same root-level mounting convention as /graphql, NOT under
// "/api" like the REST endpoints. NEXT_PUBLIC_SIGNALR_URI is an explicit override for
// cases where that derivation is wrong, mirroring the NEXT_PUBLIC_GRAPHQL_URI pattern
// already used by every lib/<entity>/graphql.ts module in this codebase.
export function getPositionsHubUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SIGNALR_URI ??
    `${(process.env.NEXT_PUBLIC_API_URI ?? "").replace(/\/api\/?$/, "")}/hubs/positions`
  );
}

// Matches Backend/Domain/Requests/MerchandiseAreaPositions/PositionCreatedNotification.cs
// as serialized by SignalR's default JSON protocol (camelCase, same as everywhere
// else in this app's wire format).
export interface PositionCreatedPayload {
  positionId: number;
  shipmentId: number;
  clientName: string;
  merchandiseDescription: string;
  vesselName: string;
  latitude: number;
  longitude: number;
  areaName: string | null;
  zoneName: string | null;
  isEmergencyPlacement: boolean;
  placedAt: string;
}

// Matches Backend/Domain/Requests/MerchandiseAreaPositions/PositionReleasedNotification.cs
export interface PositionReleasedPayload {
  positionId: number;
}
