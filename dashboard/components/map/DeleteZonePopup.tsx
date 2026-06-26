"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { deleteZone } from "@/lib/map/api";

export interface DeleteZoneTarget {
  id: number;
  name: string;
}

interface DeleteZonePopupProps {
  target: DeleteZoneTarget | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteZonePopup({ target, onOpenChange, onDeleted }: DeleteZonePopupProps) {
  const { accessToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const open = target !== null;

  const handleConfirm = async () => {
    if (!target) return;
    setIsDeleting(true);
    try {
      await deleteZone(target.id, accessToken);
      toast.success("Zone deleted");
      onOpenChange(false);
      onDeleted();
    } catch {
      toast.error("Failed to delete zone");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        overlayClassName="z-[1000]"
        className="z-[1001] max-w-105 rounded-2xl p-6 sm:rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
            <AlertTriangle size={20} className="text-[#DC2626]" />
          </div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#0F172A]">
            Delete zone {target?.name}?
          </h2>
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-[#374151]">
          This cannot be undone.
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
