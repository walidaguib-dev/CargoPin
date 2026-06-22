"use client";

import { useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Client } from "@/lib/clients/types";
import { useClients } from "@/lib/clients/hooks";

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientsTableSkeleton } from "@/components/clients/ClientsTableSkeleton";
import { EmptyState } from "@/components/clients/EmptyState";
import { CreateClientModal } from "@/components/clients/CreateClientModal";
import { EditClientModal } from "@/components/clients/EditClientModal";
import { DeleteClientPopup } from "@/components/clients/DeleteClientPopup";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { items, isLoading, isError, hasNextPage, isLoadingMore, loadMore, refetch } =
    useClients({ search: debouncedSearch });

  const isEmpty = !isLoading && !isError && items.length === 0;

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-semibold leading-tight tracking-tight text-[#0F172A]">
            Clients
          </h3>
          <p className="mt-1 text-[14px] text-[#64748B]">
            Manage client accounts and contact details
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-10 gap-1.5 rounded-xl bg-[#0EA5E9] px-4 text-[14px] font-semibold text-white hover:bg-[#0284C7]"
        >
          <Plus size={16} />
          New Client
        </Button>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="h-10 rounded-lg border-[#E2E8F0] pl-9 text-[14px] focus-visible:ring-[#0EA5E9]"
          />
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <ClientsTableSkeleton />
        ) : isError ? (
          <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 text-[14px] text-[#DC2626]">
            Failed to load clients. Please refresh and try again.
          </div>
        ) : isEmpty ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <>
            <ClientsTable
              clients={items}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
            {hasNextPage ? (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="h-10 gap-1.5 rounded-lg border-[#E2E8F0] bg-white px-4 text-[14px] font-medium text-[#374151]"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <CreateClientModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refetch}
      />
      <EditClientModal
        client={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onUpdated={refetch}
      />
      <DeleteClientPopup
        client={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onDeleted={() => {
          setDeleting(null);
          refetch();
        }}
      />
    </div>
  );
}
