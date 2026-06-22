"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { ApiValidationError, updateVessel } from "@/lib/vessels/api";
import {
  apiFieldToFormField,
  vesselSchema,
  type UpdateVesselDto,
  type Vessel,
  type VesselFormValues,
} from "@/lib/vessels/types";

import { VesselFormFields } from "./VesselFormFields";

interface EditVesselModalProps {
  vessel: Vessel | null;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

function toFormValues(v: Vessel): VesselFormValues {
  return {
    name: v.name,
    imoNumber: v.imoNumber,
    status: v.status,
  };
}

export function EditVesselModal({
  vessel,
  onOpenChange,
  onUpdated,
}: EditVesselModalProps) {
  const { accessToken } = useAuth();
  const open = vessel !== null;

  const form = useForm<VesselFormValues>({
    resolver: zodResolver(vesselSchema),
    defaultValues: {
      name: "",
      imoNumber: null,
      status: "Expected",
    },
  });

  useEffect(() => {
    if (vessel) form.reset(toFormValues(vessel));
  }, [vessel, form]);

  const isSubmitting = form.formState.isSubmitting;

  // The route segment is keyed by the vessel's name at the time the modal was
  // opened (see VesselEntityConfiguration.cs — Name is the unique key, not Id),
  // not the possibly-edited `values.name` — UpdateAsync in VesselsRepository.cs
  // looks up by the route name and applies the new name from the body, so this
  // correctly supports renaming.
  const onSubmit = form.handleSubmit(async (values) => {
    if (!vessel) return;

    const dto: UpdateVesselDto = {
      name: values.name,
      imoNumber: values.imoNumber,
      status: values.status,
    };

    try {
      await updateVessel(vessel.name, dto, accessToken);
      toast.success("Vessel updated");
      onOpenChange(false);
      onUpdated?.();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        for (const fieldError of err.fieldErrors) {
          const field = apiFieldToFormField(fieldError.field);
          if (field) {
            form.setError(field, { message: fieldError.message });
          }
        }
        toast.error("Please fix the highlighted fields");
      } else {
        toast.error("Failed to update vessel");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 rounded-2xl p-8 sm:rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">
            Edit Vessel
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            Update vessel details
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="mt-2">
            <VesselFormFields />

            <div className="mt-8 flex justify-end gap-2">
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
