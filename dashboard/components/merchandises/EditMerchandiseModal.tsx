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

import {
  merchandiseSchema,
  type Merchandise,
  type MerchandiseFormValues,
} from "@/lib/merchandises/types";

import { MerchandiseFormFields } from "./MerchandiseFormFields";

interface EditMerchandiseModalProps {
  merchandise: Merchandise | null;
  onOpenChange: (open: boolean) => void;
}

function toFormValues(m: Merchandise): MerchandiseFormValues {
  return {
    description: m.description,
    cargoType: m.cargoType as MerchandiseFormValues["cargoType"],
    weight: m.weight,
    numberOfHeat: m.numberOfHeat,
    note: m.note,
  };
}

export function EditMerchandiseModal({
  merchandise,
  onOpenChange,
}: EditMerchandiseModalProps) {
  const open = merchandise !== null;

  const form = useForm<MerchandiseFormValues>({
    resolver: zodResolver(merchandiseSchema),
    defaultValues: {
      description: "",
      cargoType: "Bulk",
      weight: null,
      numberOfHeat: null,
      note: null,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 rounded-2xl p-8 sm:rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">
            Edit Merchandise
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            Update merchandise details
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="mt-2">
            <MerchandiseFormFields />

            <div className="mt-8 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10 rounded-lg border-[#E2E8F0] bg-white px-4 text-[14px] font-medium text-[#374151]"
                // disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                // disabled={updateMutation.isPending}
                className="h-10 gap-1.5 rounded-lg bg-[#0EA5E9] px-4 text-[14px] font-semibold text-white hover:bg-[#0284C7]"
              >
                {/* {updateMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )} */}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
