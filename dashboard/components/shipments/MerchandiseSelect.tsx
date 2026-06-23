"use client";

import { useCallback } from "react";

import { fetchMerchandises } from "@/lib/merchandises/graphql";
import { CARGO_TYPE_LABELS, type Merchandise } from "@/lib/merchandises/types";

import { SearchableSelect, type SearchableSelectOption } from "./SearchableSelect";

interface MerchandiseSelectProps {
  id?: string;
  selectedLabel: string | null;
  onSelect: (option: SearchableSelectOption | null) => void;
  hasError?: boolean;
}

// query { merchandises(where: { description: { contains: $search } })
//         { nodes { id description cargoType } } }
// — reuses the existing fetchMerchandises() from lib/merchandises/graphql.ts (real
// schema is a Relay connection, not the flat "nodes" in the task spec's illustrative
// snippet). Shows description + cargoType badge in the dropdown, per the task.
// Requests more than the list page's default PAGE_SIZE since there's no "load more"
// inside the dropdown — hasNextPage still surfaces as a "refine your search" hint.
export function MerchandiseSelect({
  id,
  selectedLabel,
  onSelect,
  hasError,
}: MerchandiseSelectProps) {
  const fetchOptions = useCallback(
    (search: string) =>
      fetchMerchandises({ search, first: 50 }).then((page) => ({
        items: page.items,
        hasMore: page.hasNextPage,
      })),
    [],
  );

  return (
    <SearchableSelect<Merchandise>
      id={id}
      selectedLabel={selectedLabel}
      onSelect={onSelect}
      fetchOptions={fetchOptions}
      mapToOption={(m) => ({ id: m.id, label: m.description })}
      renderOption={(m) => (
        <>
          <span className="font-medium text-[#0F172A]">{m.description}</span>
          <span className="inline-flex items-center rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
            {CARGO_TYPE_LABELS[m.cargoType]}
          </span>
        </>
      )}
      placeholder="Search merchandise..."
      hasError={hasError}
    />
  );
}
