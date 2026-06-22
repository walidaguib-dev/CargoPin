"use client";

import { useFormContext, Controller } from "react-hook-form";
import { XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientFormValues } from "@/lib/clients/types";

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

export function ClientFormFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ClientFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name" className={labelClass}>
          Client Name *
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g., Acme Shipping Co."
          maxLength={200}
          className={`mt-1.5 ${inputClass}`}
          aria-invalid={errors.name ? true : undefined}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="contactPerson" className={labelClass}>
          Contact Person (optional)
        </Label>
        <Controller
          control={control}
          name="contactPerson"
          render={({ field }) => (
            <Input
              id="contactPerson"
              placeholder="e.g., Jane Doe"
              className={`mt-1.5 ${inputClass}`}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(e.target.value === "" ? null : e.target.value)
              }
              aria-invalid={errors.contactPerson ? true : undefined}
            />
          )}
        />
        <FieldError message={errors.contactPerson?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="phone" className={labelClass}>
            Phone (optional)
          </Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input
                id="phone"
                type="tel"
                maxLength={20}
                placeholder="e.g., +1 555 0100"
                className={`mt-1.5 ${inputClass}`}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : e.target.value)
                }
                aria-invalid={errors.phone ? true : undefined}
              />
            )}
          />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="email" className={labelClass}>
            Email (optional)
          </Label>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                placeholder="e.g., jane@acme.com"
                className={`mt-1.5 ${inputClass}`}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? null : e.target.value)
                }
                aria-invalid={errors.email ? true : undefined}
              />
            )}
          />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="taxId" className={labelClass}>
          Tax ID (optional)
        </Label>
        <Controller
          control={control}
          name="taxId"
          render={({ field }) => (
            <Input
              id="taxId"
              placeholder="e.g., FR123456789"
              className={`mt-1.5 ${inputClass}`}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(e.target.value === "" ? null : e.target.value)
              }
              aria-invalid={errors.taxId ? true : undefined}
            />
          )}
        />
        <FieldError message={errors.taxId?.message} />
      </div>
    </div>
  );
}
