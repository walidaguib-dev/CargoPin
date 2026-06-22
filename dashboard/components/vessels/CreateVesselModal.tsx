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
import { createVessel, ApiValidationError } from "@/lib/vessels/api";
import {
  apiFieldToFormField,
  vesselSchema,
  type CreateVesselDto,
  type VesselFormValues,
} from "@/lib/vessels/types";

import { VesselFormFields } from "./VesselFormFields";

interface CreateVesselModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const DEFAULTS: VesselFormValues = {
  name: "",
  imoNumber: null,
  status: "Expected",
};

export function CreateVesselModal({
  open,
  onOpenChange,
  onCreated,
}: CreateVesselModalProps) {
  const { accessToken } = useAuth();

  const form = useForm<VesselFormValues>({
    resolver: zodResolver(vesselSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (open) form.reset(DEFAULTS);
  }, [open, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    const dto: CreateVesselDto = {
      name: values.name,
      imoNumber: values.imoNumber,
      status: values.status,
    };

    try {
      await createVessel(dto, accessToken);
      toast.success("Vessel created");
      onOpenChange(false);
      onCreated?.();
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
        toast.error("Failed to create vessel");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 rounded-2xl p-8 sm:rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">
            New Vessel
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            Add a new vessel
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
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
