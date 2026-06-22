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
import { ApiValidationError, updateClient } from "@/lib/clients/api";
import {
  apiFieldToFormField,
  clientSchema,
  type Client,
  type ClientFormValues,
  type UpdateClientDto,
} from "@/lib/clients/types";

import { ClientFormFields } from "./ClientFormFields";

interface EditClientModalProps {
  client: Client | null;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

function toFormValues(c: Client): ClientFormValues {
  return {
    name: c.name,
    contactPerson: c.contactPerson,
    phone: c.phone,
    email: c.email,
    taxId: c.taxId,
  };
}

export function EditClientModal({
  client,
  onOpenChange,
  onUpdated,
}: EditClientModalProps) {
  const { accessToken } = useAuth();
  const open = client !== null;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      contactPerson: null,
      phone: null,
      email: null,
      taxId: null,
    },
  });

  useEffect(() => {
    if (client) form.reset(toFormValues(client));
  }, [client, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!client) return;

    const dto: UpdateClientDto = {
      name: values.name,
      contactPerson: values.contactPerson,
      phone: values.phone,
      email: values.email,
      taxId: values.taxId,
    };

    try {
      await updateClient(client.id, dto, accessToken);
      toast.success("Client updated");
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
        toast.error("Failed to update client");
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 rounded-2xl p-8 sm:rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-semibold text-[#0F172A]">
            Edit Client
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#64748B]">
            Update client details
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="mt-2">
            <ClientFormFields />

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
