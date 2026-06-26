"use client";

import { useCallback } from "react";

import { SearchableSelect, type SearchableSelectOption } from "@/components/shipments/SearchableSelect";
import { fetchZones } from "@/lib/zones/graphql";
import type { Zone } from "@/lib/zones/types";

interface ZoneSelectProps {
  id?: string;
  selectedLabel: string | null;
  onSelect: (option: SearchableSelectOption | null) => void;
  hasError?: boolean;
}

// Same ClientSelect/VesselSelect/MerchandiseSelect pattern from the Shipments page —
// search-driven, fetches on demand instead of eagerly loading every zone up front
// (the static <Select> in CreateAreaModal that did `fetchZones({ first: 100 })` once
// on open was the "failed to load zones" / stuck-disabled report).
export function ZoneSelect({ id, selectedLabel, onSelect, hasError }: ZoneSelectProps) {
  const fetchOptions = useCallback(
    (search: string) =>
      fetchZones({ search, first: 50 }).then((page) => ({
        items: page.items,
        hasMore: page.hasNextPage,
      })),
    [],
  );

  return (
    <SearchableSelect<Zone>
      id={id}
      selectedLabel={selectedLabel}
      onSelect={onSelect}
      fetchOptions={fetchOptions}
      mapToOption={(zone) => ({ id: zone.id, label: zone.name })}
      renderOption={(zone) => <span className="font-medium text-[#0F172A]">{zone.name}</span>}
      placeholder="Search zones..."
      hasError={hasError}
    />
  );
}
