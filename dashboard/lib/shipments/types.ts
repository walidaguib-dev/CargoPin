import { z } from "zod";

// Mirrors Backend/Domain/Enums/ShipmentStatus.cs exactly — these are the literal
// strings the REST DTOs (CreateShipmentDto/UpdateShipmentDto) accept, matching the
// values checked by CreateShipmentValidator/UpdateShipmentValidator.
export const SHIPMENT_STATUSES = [
  "Awaiting",
  "Stored",
  "PartiallyStored",
  "Released",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  Awaiting: "Awaiting",
  Stored: "Stored",
  PartiallyStored: "Partially Stored",
  Released: "Released",
};

// Backend/Domain/Entities/Shipment.cs is Id-keyed and carries both the FK scalars
// (ClientId/VesselId/MerchandiseId) and the navigation properties. The list query
// (lib/shipments/graphql.ts) fetches the FK ids directly off Shipment plus just the
// display name/description off each nested object — enough to render the table and
// to pre-fill the searchable selects in the edit form without re-fetching anything.
export interface Shipment {
  id: number;
  blNumbers: string[];
  arrivalDate: string; // ISO datetime string
  status: ShipmentStatus;
  note: string | null;
  clientId: number;
  clientName: string;
  vesselId: number;
  vesselName: string;
  merchandiseId: number;
  merchandiseDescription: string;
}

// Matches Backend/Application/Shipments/Dtos/CreateShipmentDto.cs
export interface CreateShipmentDto {
  blNumbers: string[];
  arrivalDate: string; // ISO datetime string
  status: ShipmentStatus;
  note: string | null;
  clientId: number;
  vesselId: number;
  merchandiseId: number;
}

// UpdateShipmentDto : CreateShipmentDto — same shape on the backend
export type UpdateShipmentDto = CreateShipmentDto;

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

// Mirrors CreateShipmentValidator / UpdateShipmentValidator rules:
// - BLNumbers: at least one, none blank
// - ArrivalDate: required, cannot be more than 60 days in the future
// - Status: required, one of the enum values
// - ClientId/VesselId/MerchandiseId: required (backend checks GreaterThan(0)) — the
//   searchable selects below start at 0 ("nothing selected"), matching that rule
//   literally instead of modeling the field as nullable.
export const shipmentSchema = z.object({
  blNumbers: z
    .array(z.string().min(1, "BL numbers cannot be empty."))
    .min(1, "At least one BL number is required."),
  arrivalDate: z
    .string()
    .min(1, "Arrival date is required.")
    .refine(
      (d) => new Date(d).getTime() <= Date.now() + SIXTY_DAYS_MS,
      "Arrival date cannot be more than 60 days in the future.",
    ),
  status: z.enum(SHIPMENT_STATUSES, {
    message: "Status must be Awaiting, Stored, PartiallyStored, or Released.",
  }),
  note: z.string().nullable(),
  clientId: z.number().int().gt(0, "A valid client is required."),
  vesselId: z.number().int().gt(0, "A valid vessel is required."),
  merchandiseId: z.number().int().gt(0, "A valid merchandise is required."),
});

export type ShipmentFormValues = z.infer<typeof shipmentSchema>;

// FluentValidation's PropertyName for these rules is "Dto.<Field>" because the
// validators are AbstractValidator<CreateShipmentCommand>/<UpdateShipmentCommand>
// validating `x.Dto.<Field>`. "BLNumbers" has the same acronym quirk as Vessel's
// "IMONumber" — a naive lowercase-first-letter transform produces "bLNumbers", not
// "blNumbers", so it needs an explicit override.
const FIELD_OVERRIDES: Record<string, keyof ShipmentFormValues> = {
  BLNumbers: "blNumbers",
};

export function apiFieldToFormField(field: string): keyof ShipmentFormValues | null {
  const stripped = field.startsWith("Dto.") ? field.slice(4) : field;
  if (!stripped) return null;
  if (stripped in FIELD_OVERRIDES) return FIELD_OVERRIDES[stripped];
  const camel = stripped[0].toLowerCase() + stripped.slice(1);
  if (camel in shipmentSchema.shape) {
    return camel as keyof ShipmentFormValues;
  }
  return null;
}
