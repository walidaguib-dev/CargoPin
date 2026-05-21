import { Skeleton } from "@/components/ui/skeleton";

export function MerchandiseCardSkeleton() {
  return (
    <div className="min-h-45 rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="mt-4 h-5 w-3/4 rounded" />
      <Skeleton className="mt-2 h-5 w-1/2 rounded" />
      <div className="mt-4 flex gap-6">
        <div>
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="mt-1.5 h-4 w-10 rounded" />
        </div>
        <div>
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="mt-1.5 h-4 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
