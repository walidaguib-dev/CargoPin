import { z } from "zod";

// Backend/Domain/Entities/Client.cs is Id-keyed (unlike Vessel's Name-keyed
// entity), so mutations below key off `id` — same pattern as Merchandise.
export interface Client {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
}

// Matches Backend/Application/Clients/Dtos/CreateClientDto.cs
export interface CreateClientDto {
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
}

// UpdateClientDto : CreateClientDto — same shape on the backend
export type UpdateClientDto = CreateClientDto;

// Mirrors CreateClientValidator / UpdateClientValidator rules:
// - Name: required, max 200 chars
// - Email: optional, but if present must be a valid email address
// - Phone: optional, but if present must not exceed 20 chars
// - ContactPerson, TaxId: no validator rules at all — fully free-form
export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required.")
    .max(200, "Client name must not exceed 200 characters."),
  contactPerson: z.string().nullable(),
  phone: z
    .string()
    .max(20, "Phone must not exceed 20 characters.")
    .nullable(),
  email: z
    .string()
    .email("Invalid email address.")
    .nullable(),
  taxId: z.string().nullable(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

// FluentValidation's PropertyName for these rules is "Dto.<Field>" because the
// validators are AbstractValidator<CreateClientCommand>/<UpdateClientCommand>
// validating `x.Dto.<Field>`. Unlike Vessel's IMONumber, none of these property
// names have an acronym quirk, so a plain lowercase-first-letter transform maps
// them onto our form field names without an override table.
export function apiFieldToFormField(field: string): keyof ClientFormValues | null {
  const stripped = field.startsWith("Dto.") ? field.slice(4) : field;
  if (!stripped) return null;
  const camel = stripped[0].toLowerCase() + stripped.slice(1);
  if (camel in clientSchema.shape) {
    return camel as keyof ClientFormValues;
  }
  return null;
}
