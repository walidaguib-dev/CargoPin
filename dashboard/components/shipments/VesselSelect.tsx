"use client";

import { useCallback } from "react";

import { fetchVessels } from "@/lib/vessels/graphql";
import type { Vessel } from "@/lib/vessels/types";

import { SearchableSelect, type SearchableSelectOption } from "./SearchableSelect";

interface VesselSelectProps {
  id?: string;
  selectedLabel: string | null;
  onSelect: (option: SearchableSelectOption | null) => void;
  hasError?: boolean;
}

// query { vessels(where: { name: { contains: $search } }) { nodes { id name imoNumber } } }
// — reuses the existing fetchVessels() from lib/vessels/graphql.ts (real schema is a
// Relay connection, not the flat "nodes" in the task spec's illustrative snippet).
// Shows name + IMO number in the dropdown for clarity, per the task. Requests more
// than the list page's default PAGE_SIZE since there's no "load more" inside the
// dropdown — hasNextPage still surfaces as a "refine your search" hint.
export function VesselSelect({ id, selectedLabel, onSelect, hasError }: VesselSelectProps) {
  const fetchOptions = useCallback(
    (search: string) =>
      fetchVessels({ search, first: 50 }).then((page) => ({
        items: page.items,
        hasMore: page.hasNextPage,
      })),
    [],
  );

  return (
    <SearchableSelect<Vessel>
      id={id}
      selectedLabel={selectedLabel}
      onSelect={onSelect}
      fetchOptions={fetchOptions}
      mapToOption={(vessel) => ({ id: vessel.id, label: vessel.name })}
      renderOption={(vessel) => (
        <>
          <span className="font-medium text-[#0F172A]">{vessel.name}</span>
          {vessel.imoNumber ? (
            <span className="text-[12px] text-[#64748B]">IMO {vessel.imoNumber}</span>
          ) : null}
        </>
      )}
      placeholder="Search vessels..."
      hasError={hasError}
    />
  );
}
