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
import { withRetry } from "@/lib/utils";
import {
  ApiValidationError,
  fetchAreaDetails,
  updateArea,
  type AreaDetails,
  type AreaDto,
} from "@/lib/map/api";
import { AREA_STATUS_LABELS, AREA_STATUSES } from "@/lib/areas/types";

const schema = z.object({
  name: z.string().min(1, "Area name is required.").max(100, "Area name must not exceed 100 characters."),
  code: z.string().min(1, "Area code is required.").max(20, "Code must not exceed 20 characters."),
  status: z.enum(AREA_STATUSES, { message: "Status must be Available, Occupied, or Blocked." }),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = { name: "", code: "", status: "Available", notes: null };

interface EditAreaModalProps {
  areaId: number | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditAreaModal({ areaId, onOpenChange, onUpdated }: EditAreaModalProps) {
  const { accessToken } = useAuth();
  const open = areaId !== null;
  const [isLoading, setIsLoading] = useState(false);
  // ZoneId/DesignatedMerchandiseId aren't editable here, but still need to round-trip
  // unchanged on submit — AreasRepository.UpdateAsync assigns DesignatedMerchandiseId
  // unconditionally (non-nullable int), so omitting it would corrupt the FK.
  const [details, setDetails] = useState<AreaDetails | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!areaId) {
      form.reset(EMPTY);
      setDetails(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    withRetry(() => fetchAreaDetails(areaId))
      .then((area) => {
        if (cancelled || !area) return;
        setDetails(area);
        form.reset({
          name: area.name,
          code: area.code,
          status: (AREA_STATUSES as readonly string[]).includes(area.status)
            ? (area.status as FormValues["status"])
            : "Available",
          notes: area.notes,
        });
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load area details");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [areaId, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!areaId || !details) return;

    const dto: AreaDto = {
      name: values.name,
      code: values.code,
      status: values.status,
      notes: values.notes,
      isActive: details.isActive,
      zoneId: details.zoneId,
      designatedMerchandiseId: details.designatedMerchandiseId,
    };

    try {
      await updateArea(areaId, dto, accessToken);
      toast.success("Area updated");
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        toast.error(err.fieldErrors[0]?.message ?? "Please fix the highlighted fields");
      } else {
        toast.error("Failed to update area");
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
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">Edit Area</DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            Update area details
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#94A3B8]" />
          </div>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="mt-2 flex flex-col gap-4">
              <div>
                <Label htmlFor="edit-area-name" className="text-[13px] font-medium text-[#374151]">
                  Name *
                </Label>
                <Input
                  id="edit-area-name"
                  {...form.register("name")}
                  className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]"
                  aria-invalid={form.formState.errors.name ? true : undefined}
                />
                <FieldError message={form.formState.errors.name?.message} />
              </div>

              <div>
                <Label htmlFor="edit-area-code" className="text-[13px] font-medium text-[#374151]">
                  Code *
                </Label>
                <Input
                  id="edit-area-code"
                  {...form.register("code")}
                  className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]"
                  aria-invalid={form.formState.errors.code ? true : undefined}
                />
                <FieldError message={form.formState.errors.code?.message} />
              </div>

              <div>
                <Label htmlFor="edit-area-status" className="text-[13px] font-medium text-[#374151]">
                  Status *
                </Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="edit-area-status" className="mt-1.5 h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]">
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
                <Label htmlFor="edit-area-notes" className="text-[13px] font-medium text-[#374151]">
                  Notes
                </Label>
                <Controller
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <Textarea
                      id="edit-area-notes"
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
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
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
