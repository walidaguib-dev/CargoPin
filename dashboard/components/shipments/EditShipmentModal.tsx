"use client";

import { useEffect, useState } from "react";
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
import { ApiValidationError, updateShipment } from "@/lib/shipments/api";
import { fetchShipment } from "@/lib/shipments/graphql";
import {
  apiFieldToFormField,
  shipmentSchema,
  type Shipment,
  type ShipmentFormValues,
  type UpdateShipmentDto,
} from "@/lib/shipments/types";

import { ShipmentFormFields } from "./ShipmentFormFields";

interface EditShipmentModalProps {
  shipment: Shipment | null;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

function toFormValues(s: Shipment): ShipmentFormValues {
  return {
    blNumbers: s.blNumbers,
    arrivalDate: s.arrivalDate.slice(0, 10),
    status: s.status,
    note: s.note,
    clientId: s.clientId,
    vesselId: s.vesselId,
    merchandiseId: s.merchandiseId,
  };
}

export function EditShipmentModal({
  shipment,
  onOpenChange,
  onUpdated,
}: EditShipmentModalProps) {
  const { accessToken } = useAuth();
  const open = shipment !== null;

  // The `shipment` prop is a snapshot from the list query, which can go stale
  // (e.g. the client was renamed after the list loaded). Show that snapshot
  // immediately so the modal doesn't flash empty, then silently refresh against
  // the live record so the pre-filled names/fields are accurate.
  const [liveShipment, setLiveShipment] = useState<Shipment | null>(null);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      blNumbers: [],
      arrivalDate: "",
      status: "Awaiting",
      note: null,
      clientId: 0,
      vesselId: 0,
      merchandiseId: 0,
    },
  });

  useEffect(() => {
    if (!shipment) {
      setLiveShipment(null);
      return;
    }

    setLiveShipment(shipment);
    form.reset(toFormValues(shipment));

    let cancelled = false;
    fetchShipment(shipment.id).then((fresh) => {
      if (cancelled || !fresh) return;
      setLiveShipment(fresh);
      form.reset(toFormValues(fresh));
    });

    return () => {
      cancelled = true;
    };
  }, [shipment, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!shipment) return;

    const dto: UpdateShipmentDto = {
      blNumbers: values.blNumbers,
      arrivalDate: `${values.arrivalDate}T00:00:00.000Z`,
      status: values.status,
      note: values.note,
      clientId: values.clientId,
      vesselId: values.vesselId,
      merchandiseId: values.merchandiseId,
    };

    try {
      await updateShipment(shipment.id, dto, accessToken);
      toast.success("Shipment updated");
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
        toast.error("Failed to update shipment");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 rounded-2xl p-8 sm:rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">
            Edit Shipment
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            Update shipment details
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="mt-2 max-h-[70vh] overflow-y-auto pr-1">
            <ShipmentFormFields
              initialClientLabel={liveShipment?.clientName}
              initialVesselLabel={liveShipment?.vesselName}
              initialMerchandiseLabel={liveShipment?.merchandiseDescription}
            />

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
