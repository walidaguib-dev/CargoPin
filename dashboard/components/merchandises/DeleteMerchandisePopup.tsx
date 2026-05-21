"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import type { Merchandise } from "@/lib/merchandises/types";

interface DeleteMerchandisePopupProps {
  merchandise: Merchandise | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (id: number) => void;
}

export function DeleteMerchandisePopup({
  merchandise,
  onOpenChange,
  onDeleted,
}: DeleteMerchandisePopupProps) {
  const open = merchandise !== null;

  const handleConfirm = async () => {};

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-105 rounded-2xl p-6 sm:rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
            <AlertTriangle size={20} className="text-[#DC2626]" />
          </div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#0F172A]">
            Delete merchandise?
          </h2>
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-[#374151]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#0F172A]">
            {merchandise?.description}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            // disabled={deleteMutation.isPending}
            className="h-9 rounded-lg border-[#E2E8F0] bg-white px-3 text-[14px] font-medium text-[#374151]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            // disabled={deleteMutation.isPending}
            className="h-9 gap-1.5 rounded-lg bg-[#EF4444] px-3 text-[14px] font-semibold text-white hover:bg-[#DC2626]"
          >
            {/* {deleteMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )} */}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
