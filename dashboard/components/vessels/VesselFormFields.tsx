"use client";

import { useFormContext, Controller } from "react-hook-form";
import { XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VESSEL_STATUS_LABELS,
  VESSEL_STATUSES,
  type VesselFormValues,
} from "@/lib/vessels/types";

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

export function VesselFormFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<VesselFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name" className={labelClass}>
          Vessel Name *
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g., MSC Oscar"
          maxLength={100}
          className={`mt-1.5 ${inputClass}`}
          aria-invalid={errors.name ? true : undefined}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="imoNumber" className={labelClass}>
          IMO Number
        </Label>
        <Controller
          control={control}
          name="imoNumber"
          render={({ field }) => (
            <Input
              id="imoNumber"
              inputMode="numeric"
              placeholder="7 digits, e.g., 9321483"
              maxLength={7}
              className={`mt-1.5 ${inputClass}`}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(e.target.value === "" ? null : e.target.value)
              }
              aria-invalid={errors.imoNumber ? true : undefined}
            />
          )}
        />
        <FieldError message={errors.imoNumber?.message} />
      </div>

      <div>
        <Label htmlFor="status" className={labelClass}>
          Status *
        </Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger
                id="status"
                className={`mt-1.5 ${inputClass}`}
                aria-invalid={errors.status ? true : undefined}
              >
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {VESSEL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {VESSEL_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.status?.message} />
      </div>
    </div>
  );
}
