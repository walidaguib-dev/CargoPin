"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { deleteClient } from "@/lib/clients/api";

import type { Client } from "@/lib/clients/types";

interface DeleteClientPopupProps {
  client: Client | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (id: number) => void;
}

export function DeleteClientPopup({
  client,
  onOpenChange,
  onDeleted,
}: DeleteClientPopupProps) {
  const { accessToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const open = client !== null;

  const handleConfirm = async () => {
    if (!client) return;
    setIsDeleting(true);
    try {
      await deleteClient(client.id, accessToken);
      toast.success("Client deleted");
      onOpenChange(false);
      onDeleted?.(client.id);
    } catch {
      toast.error("Failed to delete client");
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
            Delete client?
          </h2>
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-[#374151]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#0F172A]">{client?.name}</span>?
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
