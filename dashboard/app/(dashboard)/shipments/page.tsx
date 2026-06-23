"use client";

import { useState } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";

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
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUSES,
  type Shipment,
  type ShipmentStatus,
} from "@/lib/shipments/types";
import { useShipments } from "@/lib/shipments/hooks";

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

import { ShipmentsTable } from "@/components/shipments/ShipmentsTable";
import { ShipmentsTableSkeleton } from "@/components/shipments/ShipmentsTableSkeleton";
import { EmptyState } from "@/components/shipments/EmptyState";
import { CreateShipmentModal } from "@/components/shipments/CreateShipmentModal";
import { EditShipmentModal } from "@/components/shipments/EditShipmentModal";
import { DeleteShipmentPopup } from "@/components/shipments/DeleteShipmentPopup";

export default function ShipmentsPage() {
  const [clientSearch, setClientSearch] = useState("");
  const [vesselSearch, setVesselSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<ShipmentStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [deleting, setDeleting] = useState<Shipment | null>(null);

  const debouncedClientSearch = useDebouncedValue(clientSearch, 300);
  const debouncedVesselSearch = useDebouncedValue(vesselSearch, 300);

  const { items, isLoading, isError, hasNextPage, isLoadingMore, loadMore, refetch } =
    useShipments({
      clientSearch: debouncedClientSearch,
      vesselSearch: debouncedVesselSearch,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status === "all" ? undefined : status,
    });

  const isEmpty = !isLoading && !isError && items.length === 0;

  const hasActiveFilters = Boolean(
    clientSearch || vesselSearch || dateFrom || dateTo || status !== "all",
  );

  const clearFilters = () => {
    setClientSearch("");
    setVesselSearch("");
    setDateFrom("");
    setDateTo("");
    setStatus("all");
  };

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-semibold leading-tight tracking-tight text-[#0F172A]">
            Shipments
          </h3>
          <p className="mt-1 text-[14px] text-[#64748B]">
            Track incoming shipments and their port status
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-10 gap-1.5 rounded-xl bg-[#0EA5E9] px-4 text-[14px] font-semibold text-white hover:bg-[#0284C7]"
        >
          <Plus size={16} />
          New Shipment
        </Button>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-56">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <Input
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Search by client..."
            className="h-10 rounded-lg border-[#E2E8F0] pl-9 text-[14px] focus-visible:ring-[#0EA5E9]"
          />
        </div>
        <div className="relative w-full sm:w-56">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <Input
            value={vesselSearch}
            onChange={(e) => setVesselSearch(e.target.value)}
            placeholder="Search by vessel..."
            className="h-10 rounded-lg border-[#E2E8F0] pl-9 text-[14px] focus-visible:ring-[#0EA5E9]"
          />
        </div>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Arrival date from"
          className="h-10 w-full rounded-lg border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9] sm:w-40"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="Arrival date to"
          className="h-10 w-full rounded-lg border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9] sm:w-40"
        />
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as ShipmentStatus | "all")}
        >
          <SelectTrigger className="h-10 w-48 rounded-lg border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {SHIPMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {SHIPMENT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            onClick={clearFilters}
            className="h-10 gap-1.5 px-3 text-[14px] font-medium text-[#64748B] hover:text-[#0F172A]"
          >
            <X size={14} />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <ShipmentsTableSkeleton />
        ) : isError ? (
          <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 text-[14px] text-[#DC2626]">
            Failed to load shipments. Please refresh and try again.
          </div>
        ) : isEmpty ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <>
            <ShipmentsTable
              shipments={items}
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

      <CreateShipmentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refetch}
      />
      <EditShipmentModal
        shipment={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onUpdated={refetch}
      />
      <DeleteShipmentPopup
        shipment={deleting}
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
