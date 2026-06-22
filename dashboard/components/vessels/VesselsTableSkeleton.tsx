import { Skeleton } from "@/components/ui/skeleton";

export function VesselsTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th className="px-5 py-3 text-left">
              <Skeleton className="h-3 w-16 rounded" />
            </th>
            <th className="px-5 py-3 text-left">
              <Skeleton className="h-3 w-20 rounded" />
            </th>
            <th className="px-5 py-3 text-left">
              <Skeleton className="h-3 w-14 rounded" />
            </th>
            <th className="px-5 py-3 text-right">
              <Skeleton className="ml-auto h-3 w-14 rounded" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-[#E2E8F0] last:border-b-0">
              <td className="px-5 py-4">
                <Skeleton className="h-4 w-32 rounded" />
              </td>
              <td className="px-5 py-4">
                <Skeleton className="h-4 w-24 rounded" />
              </td>
              <td className="px-5 py-4">
                <Skeleton className="h-5 w-16 rounded" />
              </td>
              <td className="px-5 py-4 text-right">
                <Skeleton className="ml-auto h-5 w-5 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
