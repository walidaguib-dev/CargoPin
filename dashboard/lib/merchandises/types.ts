import { z } from "zod";

// Mirrors Backend/Domain/Enums/CargoType.cs exactly — these are the literal
// strings the REST DTOs (CreateMerchandiseDto/UpdateMerchandiseDto) accept,
// matching the values checked by CreateMerchandiseValidator/UpdateMerchandisevalidator.
export const CARGO_TYPES = [
  "GeneralCargo",
  "SteelCoils",
  "Colis",
  "Bulk",
  "Machinery",
  "Dangerous",
] as const;

export type CargoType = (typeof CARGO_TYPES)[number];

export const CARGO_TYPE_LABELS: Record<CargoType, string> = {
  GeneralCargo: "General Cargo",
  SteelCoils: "Steel Coils",
  Colis: "Colis",
  Bulk: "Bulk",
  Machinery: "Machinery",
  Dangerous: "Dangerous",
};

export interface Merchandise {
  id: number;
  description: string;
  cargoType: CargoType;
  weight: number | null;
  numberOfHeat: number | null;
  note: string | null;
}

// Matches Backend/Application/Merchandises/Dtos/CreateMerchandiseDto.cs
export interface CreateMerchandiseDto {
  description: string;
  cargoType: CargoType;
  weight: number | null;
  numberOfHeat: number | null;
  note: string | null;
}

// UpdateMerchandiseDto : CreateMerchandiseDto — same shape on the backend
export type UpdateMerchandiseDto = CreateMerchandiseDto;

// Mirrors CreateMerchandiseValidator / UpdateMerchandisevalidator rules:
// - Description: required, max 200 chars
// - CargoType: required, must be one of the enum values
// - Weight: optional, but if present must be > 0
// - NumberOfHeat: optional, but if present must be a whole number > 0
// - Note: optional, but if present (non-null) must be non-empty
export const merchandiseSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required.")
    .max(200, "Description must not exceed 200 characters."),
  cargoType: z.enum(CARGO_TYPES, {
    message:
      "Status must be GeneralCargo, SteelCoils, Colis, Bulk, Machinery, or Dangerous",
  }),
  weight: z
    .number()
    .gt(0, "Weight must be greater than 0.")
    .nullable(),
  numberOfHeat: z
    .number()
    .int("Number of heat must be a whole number.")
    .gt(0, "Number of heat must be greater than 0.")
    .nullable(),
  note: z
    .string()
    .min(1, "note must be not null")
    .nullable(),
});

export type MerchandiseFormValues = z.infer<typeof merchandiseSchema>;

// FluentValidation's PropertyName for these rules is "Dto.<Field>" because the
// validators are AbstractValidator<CreateMerchandiseCommand>/<UpdateMerchandiseCommand>
// validating `x.Dto.<Field>`. The global exception handler echoes that PropertyName
// back verbatim as `field`, so we strip the "Dto." prefix and lowercase the first
// letter to map it onto our form field names.
export function apiFieldToFormField(field: string): keyof MerchandiseFormValues | null {
  const stripped = field.startsWith("Dto.") ? field.slice(4) : field;
  if (!stripped) return null;
  const camel = stripped[0].toLowerCase() + stripped.slice(1);
  if (camel in merchandiseSchema.shape) {
    return camel as keyof MerchandiseFormValues;
  }
  return null;
}
