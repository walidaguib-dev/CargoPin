"use client";

import { useCallback } from "react";

import { fetchClients } from "@/lib/clients/graphql";
import type { Client } from "@/lib/clients/types";

import { SearchableSelect, type SearchableSelectOption } from "./SearchableSelect";

interface ClientSelectProps {
  id?: string;
  selectedLabel: string | null;
  onSelect: (option: SearchableSelectOption | null) => void;
  hasError?: boolean;
}

// query { clients(where: { name: { contains: $search } }) { nodes { id name } } }
// — reuses the existing fetchClients() from lib/clients/graphql.ts (the real schema
// is a Relay connection — edges/node, not the flat "nodes" shown in the task spec's
// illustrative snippet) instead of duplicating a second Clients query string.
// Requests more than the list page's default PAGE_SIZE since there's no "load more"
// inside the dropdown — hasNextPage still surfaces as a "refine your search" hint.
export function ClientSelect({ id, selectedLabel, onSelect, hasError }: ClientSelectProps) {
  const fetchOptions = useCallback(
    (search: string) =>
      fetchClients({ search, first: 50 }).then((page) => ({
        items: page.items,
        hasMore: page.hasNextPage,
      })),
    [],
  );

  return (
    <SearchableSelect<Client>
      id={id}
      selectedLabel={selectedLabel}
      onSelect={onSelect}
      fetchOptions={fetchOptions}
      mapToOption={(client) => ({ id: client.id, label: client.name })}
      renderOption={(client) => <span className="font-medium text-[#0F172A]">{client.name}</span>}
      placeholder="Search clients..."
      hasError={hasError}
    />
  );
}
