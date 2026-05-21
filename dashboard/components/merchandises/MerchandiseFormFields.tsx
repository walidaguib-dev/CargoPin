"use client";

import { useFormContext, Controller } from "react-hook-form";
import { XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARGO_TYPES, type MerchandiseFormValues } from "@/lib/merchandises/types";

const labelClass = "text-[13px] font-medium text-[#374151]";
const inputClass =
  "h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]";

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500">
      <XCircle size={12} />
      {message}
    </p>
  );
}

export function MerchandiseFormFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<MerchandiseFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="description" className={labelClass}>
          Description *
        </Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="e.g., Steel Coils"
          maxLength={200}
          className={`mt-1.5 ${inputClass}`}
          aria-invalid={errors.description ? true : undefined}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div>
        <Label htmlFor="cargoType" className={labelClass}>
          Cargo Type *
        </Label>
        <Controller
          control={control}
          name="cargoType"
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id="cargoType"
                className={`mt-1.5 ${inputClass}`}
                aria-invalid={errors.cargoType ? true : undefined}
              >
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {CARGO_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.cargoType?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="weight" className={labelClass}>
            Weight (tons)
          </Label>
          <Controller
            control={control}
            name="weight"
            render={({ field }) => (
              <Input
                id="weight"
                type="number"
                min={0}
                step={0.01}
                inputMode="decimal"
                placeholder="0"
                className={`mt-1.5 ${inputClass}`}
                value={field.value === null ? "" : field.value}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === "" ? null : Number(v));
                }}
                aria-invalid={errors.weight ? true : undefined}
              />
            )}
          />
          <FieldError message={errors.weight?.message} />
        </div>
        <div>
          <Label htmlFor="numberOfHeat" className={labelClass}>
            Heat Number
          </Label>
          <Controller
            control={control}
            name="numberOfHeat"
            render={({ field }) => (
              <Input
                id="numberOfHeat"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                placeholder="0"
                className={`mt-1.5 ${inputClass}`}
                value={field.value === null ? "" : field.value}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === "" ? null : Number(v));
                }}
                aria-invalid={errors.numberOfHeat ? true : undefined}
              />
            )}
          />
          <FieldError message={errors.numberOfHeat?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="note" className={labelClass}>
          Note
        </Label>
        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <Textarea
              id="note"
              rows={3}
              maxLength={500}
              placeholder="Additional information..."
              className="mt-1.5 resize-y border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]"
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(e.target.value === "" ? null : e.target.value)
              }
              aria-invalid={errors.note ? true : undefined}
            />
          )}
        />
        <FieldError message={errors.note?.message} />
      </div>
    </div>
  );
}
