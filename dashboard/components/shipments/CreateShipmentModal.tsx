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
import { createShipment, ApiValidationError } from "@/lib/shipments/api";
import {
  apiFieldToFormField,
  shipmentSchema,
  type CreateShipmentDto,
  type ShipmentFormValues,
} from "@/lib/shipments/types";

import { ShipmentFormFields } from "./ShipmentFormFields";

interface CreateShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const DEFAULTS: ShipmentFormValues = {
  blNumbers: [],
  arrivalDate: "",
  status: "Awaiting",
  note: null,
  clientId: 0,
  vesselId: 0,
  merchandiseId: 0,
};

export function CreateShipmentModal({
  open,
  onOpenChange,
  onCreated,
}: CreateShipmentModalProps) {
  const { accessToken } = useAuth();

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (open) form.reset(DEFAULTS);
  }, [open, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    const dto: CreateShipmentDto = {
      blNumbers: values.blNumbers,
      arrivalDate: `${values.arrivalDate}T00:00:00.000Z`,
      status: values.status,
      note: values.note,
      clientId: values.clientId,
      vesselId: values.vesselId,
      merchandiseId: values.merchandiseId,
    };

    try {
      await createShipment(dto, accessToken);
      toast.success("Shipment created");
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
        toast.error("Failed to create shipment");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 rounded-2xl p-8 sm:rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">
            New Shipment
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            Add a new shipment
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="mt-2 max-h-[70vh] overflow-y-auto pr-1">
            <ShipmentFormFields />

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
