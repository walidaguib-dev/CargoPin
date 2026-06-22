"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchVessels } from "./graphql";
import type { Vessel, VesselStatus } from "./types";

interface UseVesselsOptions {
  search?: string;
  status?: VesselStatus;
}

interface UseVesselsResult {
  items: Vessel[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useVessels({ search, status }: UseVesselsOptions): UseVesselsResult {
  const [items, setItems] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  // Resets to the first page whenever the filters (or `version`) change.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    fetchVessels({ search, status })
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setHasNextPage(page.hasNextPage);
        setEndCursor(page.endCursor);
      })
      .catch(() => {
        if (cancelled) return;
        setIsError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, status, version]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    setIsLoadingMore(true);

    fetchVessels({ search, status, after: endCursor })
      .then((page) => {
        setItems((prev) => [...prev, ...page.items]);
        setHasNextPage(page.hasNextPage);
        setEndCursor(page.endCursor);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoadingMore(false));
  }, [search, status, endCursor, hasNextPage, isLoadingMore]);

  return { items, isLoading, isError, hasNextPage, isLoadingMore, loadMore, refetch };
}
