"use client";

import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { MerchandiseSelect } from "@/components/shipments/MerchandiseSelect";
import { ApiValidationError, createZone, toBoundaryCoordinates, type ZoneDto } from "@/lib/map/api";
import { ZONE_TYPE_LABELS, ZONE_TYPES, type ZoneType } from "@/lib/zones/types";

// Mirrors Backend/Application/Zones/Validators/CreateZoneValidator.cs — note the
// task's modal spec said "Type dropdown (Hangar, OpenYard, Mixed, Restricted)" and
// omitted a merchandise field entirely; neither matches the real backend. ZoneType
// only has Hangar/Quay, and DesignatedMerchandiseId is required for Hangar zones,
// forbidden for Quay zones (CreateZoneValidator enforces both).
const schema = z
  .object({
    name: z.string().min(1, "Zone name is required.").max(100, "Zone name must not exceed 100 characters."),
    code: z.string().min(1, "Zone code is required.").max(20, "Code must not exceed 20 characters."),
    type: z.enum(ZONE_TYPES, { message: "Type must be Hangar or Quay." }),
    notes: z.string().nullable(),
    designatedMerchandiseId: z.number().int(),
  })
  .refine((v) => v.type !== "Hangar" || v.designatedMerchandiseId > 0, {
    message: "A designated merchandise is required for Hangar zones.",
    path: ["designatedMerchandiseId"],
  });

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  name: "",
  code: "",
  type: "Hangar",
  notes: null,
  designatedMerchandiseId: 0,
};

interface CreateZoneModalProps {
  open: boolean;
  coordinates: [number, number][] | null;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateZoneModal({
  open,
  coordinates,
  onOpenChange,
  onCreated,
}: CreateZoneModalProps) {
  const { accessToken } = useAuth();
  const [merchandiseLabel, setMerchandiseLabel] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      form.reset(DEFAULTS);
      setMerchandiseLabel(null);
    }
  }, [open, form]);

  const type = form.watch("type");
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!coordinates) return;

    const dto: ZoneDto = {
      name: values.name,
      code: values.code,
      type: values.type,
      notes: values.notes,
      isActive: true,
      boundary: toBoundaryCoordinates(coordinates),
      designatedMerchandiseId: values.type === "Hangar" ? values.designatedMerchandiseId : null,
    };

    try {
      await createZone(dto, accessToken);
      toast.success("Zone created");
      onOpenChange(false);
      onCreated();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        toast.error(err.fieldErrors[0]?.message ?? "Please fix the highlighted fields");
      } else {
        toast.error("Failed to create zone");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[1000]"
        className="z-[1001] max-w-110 rounded-2xl p-8 sm:rounded-2xl"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">New Zone</DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            The drawn polygon will become this zone&apos;s boundary
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="mt-2 flex flex-col gap-4">
            <div>
              <Label htmlFor="zone-name" className="text-[13px] font-medium text-[#374151]">
                Name *
              </Label>
              <Input
                id="zone-name"
                {...form.register("name")}
                className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]"
                aria-invalid={form.formState.errors.name ? true : undefined}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>

            <div>
              <Label htmlFor="zone-code" className="text-[13px] font-medium text-[#374151]">
                Code *
              </Label>
              <Input
                id="zone-code"
                {...form.register("code")}
                className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]"
                aria-invalid={form.formState.errors.code ? true : undefined}
              />
              <FieldError message={form.formState.errors.code?.message} />
            </div>

            <div>
              <Label htmlFor="zone-type" className="text-[13px] font-medium text-[#374151]">
                Type *
              </Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as ZoneType)}
                  >
                    <SelectTrigger id="zone-type" className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[1002]">
                      {ZONE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {ZONE_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {type === "Hangar" ? (
              <div>
                <Label className="text-[13px] font-medium text-[#374151]">
                  Designated Merchandise *
                </Label>
                <Controller
                  control={form.control}
                  name="designatedMerchandiseId"
                  render={({ field }) => (
                    <MerchandiseSelect
                      selectedLabel={field.value > 0 ? merchandiseLabel : null}
                      onSelect={(option) => {
                        field.onChange(option?.id ?? 0);
                        setMerchandiseLabel(option?.label ?? null);
                      }}
                      hasError={Boolean(form.formState.errors.designatedMerchandiseId)}
                    />
                  )}
                />
                <FieldError message={form.formState.errors.designatedMerchandiseId?.message} />
              </div>
            ) : null}

            <div>
              <Label htmlFor="zone-notes" className="text-[13px] font-medium text-[#374151]">
                Notes
              </Label>
              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    id="zone-notes"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                    className="mt-1.5 text-[14px] focus-visible:ring-[#0EA5E9]"
                  />
                )}
              />
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border-[#E2E8F0] bg-white px-4 text-[14px] font-medium text-[#374151]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 gap-1.5 rounded-lg bg-[#0EA5E9] px-4 text-[14px] font-semibold text-white hover:bg-[#0284C7]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Zone"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500">
      <XCircle size={12} />
      {message}
    </p>
  );
}
