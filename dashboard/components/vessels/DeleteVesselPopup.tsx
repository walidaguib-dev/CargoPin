"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { deleteVessel } from "@/lib/vessels/api";

import type { Vessel } from "@/lib/vessels/types";

interface DeleteVesselPopupProps {
  vessel: Vessel | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (name: string) => void;
}

export function DeleteVesselPopup({
  vessel,
  onOpenChange,
  onDeleted,
}: DeleteVesselPopupProps) {
  const { accessToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const open = vessel !== null;

  const handleConfirm = async () => {
    if (!vessel) return;
    setIsDeleting(true);
    try {
      await deleteVessel(vessel.name, accessToken);
      toast.success("Vessel deleted");
      onOpenChange(false);
      onDeleted?.(vessel.name);
    } catch {
      toast.error("Failed to delete vessel");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-105 rounded-2xl p-6 sm:rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
            <AlertTriangle size={20} className="text-[#DC2626]" />
          </div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#0F172A]">
            Delete vessel?
          </h2>
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-[#374151]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#0F172A]">{vessel?.name}</span>?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="h-9 rounded-lg border-[#E2E8F0] bg-white px-3 text-[14px] font-medium text-[#374151]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="h-9 gap-1.5 rounded-lg bg-[#EF4444] px-3 text-[14px] font-semibold text-white hover:bg-[#DC2626]"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
