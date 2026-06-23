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
import {
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUSES,
  type ShipmentFormValues,
} from "@/lib/shipments/types";

import { BLNumbersInput } from "./BLNumbersInput";
import { ClientSelect } from "./ClientSelect";
import { VesselSelect } from "./VesselSelect";
import { MerchandiseSelect } from "./MerchandiseSelect";

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

interface ShipmentFormFieldsProps {
  // The selects are controlled by id (number) in form state, but their display
  // label (client/vessel name, merchandise description) isn't derivable from the
  // id alone — the edit form passes the shipment's current names down so the
  // selects can pre-fill without an extra fetch; the create form passes nulls.
  initialClientLabel?: string | null;
  initialVesselLabel?: string | null;
  initialMerchandiseLabel?: string | null;
}

export function ShipmentFormFields({
  initialClientLabel = null,
  initialVesselLabel = null,
  initialMerchandiseLabel = null,
}: ShipmentFormFieldsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ShipmentFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="clientId" className={labelClass}>
          Client *
        </Label>
        <Controller
          control={control}
          name="clientId"
          render={({ field }) => (
            <ClientSelect
              id="clientId"
              selectedLabel={field.value > 0 ? initialClientLabel : null}
              onSelect={(option) => field.onChange(option?.id ?? 0)}
              hasError={Boolean(errors.clientId)}
            />
          )}
        />
        <FieldError message={errors.clientId?.message} />
      </div>

      <div>
        <Label htmlFor="vesselId" className={labelClass}>
          Vessel *
        </Label>
        <Controller
          control={control}
          name="vesselId"
          render={({ field }) => (
            <VesselSelect
              id="vesselId"
              selectedLabel={field.value > 0 ? initialVesselLabel : null}
              onSelect={(option) => field.onChange(option?.id ?? 0)}
              hasError={Boolean(errors.vesselId)}
            />
          )}
        />
        <FieldError message={errors.vesselId?.message} />
      </div>

      <div>
        <Label htmlFor="merchandiseId" className={labelClass}>
          Merchandise *
        </Label>
        <Controller
          control={control}
          name="merchandiseId"
          render={({ field }) => (
            <MerchandiseSelect
              id="merchandiseId"
              selectedLabel={field.value > 0 ? initialMerchandiseLabel : null}
              onSelect={(option) => field.onChange(option?.id ?? 0)}
              hasError={Boolean(errors.merchandiseId)}
            />
          )}
        />
        <FieldError message={errors.merchandiseId?.message} />
      </div>

      <div>
        <Label htmlFor="blNumbers" className={labelClass}>
          BL Numbers *
        </Label>
        <Controller
          control={control}
          name="blNumbers"
          render={({ field }) => (
            <div className="mt-1.5">
              <BLNumbersInput
                id="blNumbers"
                value={field.value}
                onChange={field.onChange}
                hasError={Boolean(errors.blNumbers)}
              />
            </div>
          )}
        />
        <FieldError message={errors.blNumbers?.message} />
      </div>

      <div>
        <Label htmlFor="arrivalDate" className={labelClass}>
          Arrival Date *
        </Label>
        <Input
          id="arrivalDate"
          type="date"
          {...register("arrivalDate")}
          className={`mt-1.5 ${inputClass}`}
          aria-invalid={errors.arrivalDate ? true : undefined}
        />
        <FieldError message={errors.arrivalDate?.message} />
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
                {SHIPMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SHIPMENT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.status?.message} />
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
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
              placeholder="Optional note..."
              className="mt-1.5 text-[14px] focus-visible:ring-[#0EA5E9]"
              aria-invalid={errors.note ? true : undefined}
            />
          )}
        />
        <FieldError message={errors.note?.message} />
      </div>
    </div>
  );
}
