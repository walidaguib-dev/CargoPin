import { z } from "zod";

// Mirrors Backend/Domain/Enums/VesselStatus.cs exactly — these are the literal
// strings the REST DTOs (CreateVesselDto/UpdateVesselDto) accept, matching the
// values checked by CreateVesselValidator/UpdateVesselValidator.
export const VESSEL_STATUSES = ["Expected", "Berthed", "Departed"] as const;

export type VesselStatus = (typeof VESSEL_STATUSES)[number];

export const VESSEL_STATUS_LABELS: Record<VesselStatus, string> = {
  Expected: "Expected",
  Berthed: "Berthed",
  Departed: "Departed",
};

// Backend/Domain/Entities/Vessel.cs has Name as the unique key (see
// VesselEntityConfiguration.cs), not Id, so all mutations below key off `name`.
export interface Vessel {
  id: number;
  name: string;
  imoNumber: string | null;
  status: VesselStatus;
}

// Matches Backend/Application/Vessels/Dtos/CreateVesselDto.cs
export interface CreateVesselDto {
  name: string;
  imoNumber: string | null;
  status: VesselStatus;
}

// UpdateVesselDto : CreateVesselDto — same shape on the backend
export type UpdateVesselDto = CreateVesselDto;

// Mirrors CreateVesselValidator / UpdateVesselValidator rules:
// - Name: required, max 100 chars
// - IMONumber: optional, but if present must be exactly 7 digits
// - Status: required, must be one of the enum values
export const vesselSchema = z.object({
  name: z
    .string()
    .min(1, "Vessel name is required.")
    .max(100, "Vessel name must not exceed 100 characters."),
  imoNumber: z
    .string()
    .regex(/^\d{7}$/, "IMO number must be exactly 7 digits.")
    .nullable(),
  status: z.enum(VESSEL_STATUSES, {
    message: "Status must be Expected, Berthed, or Departed.",
  }),
});

export type VesselFormValues = z.infer<typeof vesselSchema>;

// FluentValidation's PropertyName for these rules is "Dto.<Field>" because the
// validators are AbstractValidator<CreateVesselCommand>/<UpdateVesselCommand>
// validating `x.Dto.<Field>`. Unlike Merchandise's fields, "IMONumber" doesn't
// lowercase-first-letter into a conventional camelCase name (it becomes
// "iMONumber", not "imoNumber"), so it needs an explicit override here.
const FIELD_OVERRIDES: Record<string, keyof VesselFormValues> = {
  IMONumber: "imoNumber",
};

export function apiFieldToFormField(field: string): keyof VesselFormValues | null {
  const stripped = field.startsWith("Dto.") ? field.slice(4) : field;
  if (!stripped) return null;
  if (stripped in FIELD_OVERRIDES) return FIELD_OVERRIDES[stripped];
  const camel = stripped[0].toLowerCase() + stripped.slice(1);
  if (camel in vesselSchema.shape) {
    return camel as keyof VesselFormValues;
  }
  return null;
}
