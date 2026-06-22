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
  CARGO_TYPE_LABELS,
  CARGO_TYPES,
  type CargoType,
  type Merchandise,
} from "@/lib/merchandises/types";
import { useMerchandises } from "@/lib/merchandises/hooks";

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

import { MerchandiseCard } from "@/components/merchandises/MerchandiseCard";
import { MerchandiseCardSkeleton } from "@/components/merchandises/MerchandiseCardSkeleton";
import { EmptyState } from "@/components/merchandises/EmptyState";
import { CreateMerchandiseModal } from "@/components/merchandises/CreateMerchandiseModal";
import { EditMerchandiseModal } from "@/components/merchandises/EditMerchandiseModal";
import { DeleteMerchandisePopup } from "@/components/merchandises/DeleteMerchandisePopup";

export default function MerchandisesPage() {
  const [search, setSearch] = useState("");
  const [cargoType, setCargoType] = useState<CargoType | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Merchandise | null>(null);
  const [deleting, setDeleting] = useState<Merchandise | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { items, isLoading, isError, hasNextPage, isLoadingMore, loadMore, refetch } =
    useMerchandises({
      search: debouncedSearch,
      cargoType: cargoType === "all" ? undefined : cargoType,
    });

  const isEmpty = !isLoading && !isError && items.length === 0;

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-semibold leading-tight tracking-tight text-[#0F172A]">
            Merchandises
          </h3>
          <p className="mt-1 text-[14px] text-[#64748B]">
            Manage cargo types and properties
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-10 gap-1.5 rounded-xl bg-[#0EA5E9] px-4 text-[14px] font-semibold text-white hover:bg-[#0284C7]"
        >
          <Plus size={16} />
          New Merchandise
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
            placeholder="Search merchandises..."
            className="h-10 rounded-lg border-[#E2E8F0] pl-9 text-[14px] focus-visible:ring-[#0EA5E9]"
          />
        </div>
        <Select
          value={cargoType}
          onValueChange={(v) => setCargoType(v as CargoType | "all")}
        >
          <SelectTrigger className="h-10 w-48 rounded-lg border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {CARGO_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {CARGO_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <MerchandiseCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 text-[14px] text-[#DC2626]">
            Failed to load merchandises. Please refresh and try again.
          </div>
        ) : isEmpty ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((m) => (
                <MerchandiseCard
                  key={m.id}
                  merchandise={m}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              ))}
            </div>
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

      <CreateMerchandiseModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refetch}
      />
      <EditMerchandiseModal
        merchandise={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onUpdated={refetch}
      />
      <DeleteMerchandisePopup
        merchandise={deleting}
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
