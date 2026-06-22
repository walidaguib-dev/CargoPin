"use client";

import { useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VESSEL_STATUS_LABELS,
  VESSEL_STATUSES,
  type Vessel,
  type VesselStatus,
} from "@/lib/vessels/types";
import { useVessels } from "@/lib/vessels/hooks";

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

import { VesselsTable } from "@/components/vessels/VesselsTable";
import { VesselsTableSkeleton } from "@/components/vessels/VesselsTableSkeleton";
import { EmptyState } from "@/components/vessels/EmptyState";
import { CreateVesselModal } from "@/components/vessels/CreateVesselModal";
import { EditVesselModal } from "@/components/vessels/EditVesselModal";
import { DeleteVesselPopup } from "@/components/vessels/DeleteVesselPopup";

export default function VesselsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VesselStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Vessel | null>(null);
  const [deleting, setDeleting] = useState<Vessel | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { items, isLoading, isError, hasNextPage, isLoadingMore, loadMore, refetch } =
    useVessels({
      search: debouncedSearch,
      status: status === "all" ? undefined : status,
    });

  const isEmpty = !isLoading && !isError && items.length === 0;

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-semibold leading-tight tracking-tight text-[#0F172A]">
            Vessels
          </h3>
          <p className="mt-1 text-[14px] text-[#64748B]">
            Manage vessels and their port status
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-10 gap-1.5 rounded-xl bg-[#0EA5E9] px-4 text-[14px] font-semibold text-white hover:bg-[#0284C7]"
        >
          <Plus size={16} />
          New Vessel
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
            placeholder="Search vessels..."
            className="h-10 rounded-lg border-[#E2E8F0] pl-9 text-[14px] focus-visible:ring-[#0EA5E9]"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as VesselStatus | "all")}
        >
          <SelectTrigger className="h-10 w-48 rounded-lg border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {VESSEL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {VESSEL_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <VesselsTableSkeleton />
        ) : isError ? (
          <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 text-[14px] text-[#DC2626]">
            Failed to load vessels. Please refresh and try again.
          </div>
        ) : isEmpty ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <>
            <VesselsTable
              vessels={items}
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

      <CreateVesselModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refetch}
      />
      <EditVesselModal
        vessel={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onUpdated={refetch}
      />
      <DeleteVesselPopup
        vessel={deleting}
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
