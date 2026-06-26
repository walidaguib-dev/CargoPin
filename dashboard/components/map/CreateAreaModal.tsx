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
import { ZoneSelect } from "@/components/map/ZoneSelect";
import { ApiValidationError, createArea, toBoundaryCoordinates, type AreaDto } from "@/lib/map/api";
import { AREA_STATUS_LABELS, AREA_STATUSES, type AreaStatus } from "@/lib/areas/types";

// Mirrors Backend/Application/Areas/Validators/CreateAreaValidator.cs. The task's
// modal spec listed Name/Code/Zone/Status/Notes only — it omitted Merchandise
// entirely, but CreateAreaDto.DesignatedMerchandiseId is required (GreaterThan(0)),
// so a Merchandise select was added to make this flow actually pass validation.
const schema = z.object({
  name: z.string().min(1, "Area name is required.").max(100, "Area name must not exceed 100 characters."),
  code: z.string().min(1, "Area code is required.").max(20, "Code must not exceed 20 characters."),
  zoneId: z.number().int().gt(0, "A valid zone is required."),
  status: z.enum(AREA_STATUSES, { message: "Status must be Available, Occupied, or Blocked." }),
  designatedMerchandiseId: z.number().int().gt(0, "A designated merchandise is required."),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  name: "",
  code: "",
  zoneId: 0,
  status: "Available",
  designatedMerchandiseId: 0,
  notes: null,
};

interface CreateAreaModalProps {
  open: boolean;
  coordinates: [number, number][] | null;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateAreaModal({
  open,
  coordinates,
  onOpenChange,
  onCreated,
}: CreateAreaModalProps) {
  const { accessToken } = useAuth();
  const [merchandiseLabel, setMerchandiseLabel] = useState<string | null>(null);
  const [zoneLabel, setZoneLabel] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(DEFAULTS);
    setMerchandiseLabel(null);
    setZoneLabel(null);
  }, [open, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!coordinates) return;

    const dto: AreaDto = {
      name: values.name,
      code: values.code,
      status: values.status,
      notes: values.notes,
      isActive: true,
      zoneId: values.zoneId,
      designatedMerchandiseId: values.designatedMerchandiseId,
      boundary: toBoundaryCoordinates(coordinates),
    };

    try {
      await createArea(dto, accessToken);
      toast.success("Area created");
      onOpenChange(false);
      onCreated();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        toast.error(err.fieldErrors[0]?.message ?? "Please fix the highlighted fields");
      } else {
        toast.error("Failed to create area");
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
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">New Area</DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            The drawn polygon will become this area&apos;s boundary
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="mt-2 flex flex-col gap-4">
            <div>
              <Label htmlFor="area-name" className="text-[13px] font-medium text-[#374151]">
                Name *
              </Label>
              <Input
                id="area-name"
                {...form.register("name")}
                className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]"
                aria-invalid={form.formState.errors.name ? true : undefined}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>

            <div>
              <Label htmlFor="area-code" className="text-[13px] font-medium text-[#374151]">
                Code *
              </Label>
              <Input
                id="area-code"
                {...form.register("code")}
                className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]"
                aria-invalid={form.formState.errors.code ? true : undefined}
              />
              <FieldError message={form.formState.errors.code?.message} />
            </div>

            <div>
              <Label htmlFor="area-zone" className="text-[13px] font-medium text-[#374151]">
                Zone *
              </Label>
              <Controller
                control={form.control}
                name="zoneId"
                render={({ field }) => (
                  <ZoneSelect
                    id="area-zone"
                    selectedLabel={field.value > 0 ? zoneLabel : null}
                    onSelect={(option) => {
                      field.onChange(option?.id ?? 0);
                      setZoneLabel(option?.label ?? null);
                    }}
                    hasError={Boolean(form.formState.errors.zoneId)}
                  />
                )}
              />
              <FieldError message={form.formState.errors.zoneId?.message} />
            </div>

            <div>
              <Label htmlFor="area-status" className="text-[13px] font-medium text-[#374151]">
                Status *
              </Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v as AreaStatus)}>
                    <SelectTrigger id="area-status" className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[1002]">
                      {AREA_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {AREA_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#374151]">Designated Merchandise *</Label>
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

            <div>
              <Label htmlFor="area-notes" className="text-[13px] font-medium text-[#374151]">
                Notes
              </Label>
              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    id="area-notes"
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
                className="h-10 gap-1.5 rounded-lg bg-[#16A34A] px-4 text-[14px] font-semibold text-white hover:bg-[#15803D]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Area"
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
