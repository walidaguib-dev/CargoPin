"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { MerchandiseDetailCard } from "@/components/merchandises/MerchandiseDetailCard";
import { EditMerchandiseModal } from "@/components/merchandises/EditMerchandiseModal";
import { DeleteMerchandisePopup } from "@/components/merchandises/DeleteMerchandisePopup";
import { useMerchandise } from "@/lib/merchandises/hooks";

function parseId(raw: string | string[] | undefined): number | null {
  if (typeof raw !== "string") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function BackLink() {
  return (
    <Link
      href="/merchandises"
      className="inline-flex items-center gap-1.5 text-[14px] text-[#64748B] transition-colors hover:text-[#0EA5E9]"
    >
      <ArrowLeft size={15} />
      Back to Merchandises
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-180 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-20 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <Skeleton className="mt-5 h-9 w-2/3 rounded" />
      <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="mt-2 h-5 w-32 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Skeleton className="h-3 w-12 rounded" />
        <Skeleton className="mt-2 h-4 w-full rounded" />
        <Skeleton className="mt-1 h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-[16px] font-semibold text-[#0F172A]">
        Merchandise not found
      </h2>
      <p className="mt-1 text-[14px] text-[#64748B]">
        It may have been deleted or moved.
      </p>
      <div className="mt-6">
        <BackLink />
      </div>
    </div>
  );
}

export default function MerchandiseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = parseId(params.id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useMerchandise(id);

  if (id === null) {
    return (
      <div>
        <BackLink />
        <div className="mt-6">
          <NotFound />
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackLink />

      <div className="mt-6">
        {isLoading ? (
          <DetailSkeleton />
        ) : isError || !data ? (
          <NotFound />
        ) : (
          <MerchandiseDetailCard
            merchandise={data}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />
        )}
      </div>

      <EditMerchandiseModal
        merchandise={editOpen && data ? data : null}
        onOpenChange={(open) => {
          if (!open) setEditOpen(false);
        }}
        onUpdated={() => {
          setEditOpen(false);
          refetch();
        }}
      />
      <DeleteMerchandisePopup
        merchandise={deleteOpen && data ? data : null}
        onOpenChange={(open) => {
          if (!open) setDeleteOpen(false);
        }}
        onDeleted={() => router.push("/merchandises")}
      />
    </div>
  );
}
