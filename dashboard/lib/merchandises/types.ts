import { z } from "zod";

export type CargoType = "Bulk" | "General" | "Container" | "Vehicle";

export const CARGO_TYPES: CargoType[] = [
  "Bulk",
  "General",
  "Container",
  "Vehicle",
];

export interface Merchandise {
  id: number;
  description: string;
  cargoType: string;
  weight: number | null;
  numberOfHeat: number | null;
  note: string | null;
}

export interface CreateMerchandiseDto {
  description: string;
  cargoType: string;
  weight: number | null;
  numberOfHeat: number | null;
  note: string | null;
}

export type UpdateMerchandiseDto = CreateMerchandiseDto;

export const merchandiseSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or fewer"),
  cargoType: z.enum(["Bulk", "General", "Container", "Vehicle"], {
    message: "Cargo type is required",
  }),
  weight: z.number().min(0, "Weight must be 0 or greater").nullable(),
  numberOfHeat: z
    .number()
    .int("Heat number must be a whole number")
    .min(0, "Heat number must be 0 or greater")
    .nullable(),
  note: z.string().max(500, "Note must be 500 characters or fewer").nullable(),
});

export type MerchandiseFormValues = z.infer<typeof merchandiseSchema>;
