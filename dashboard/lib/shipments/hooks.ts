"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchShipments } from "./graphql";
import type { ShipmentStatus } from "./types";
import type { Shipment } from "./types";

interface UseShipmentsOptions {
  clientSearch?: string;
  vesselSearch?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: ShipmentStatus;
}

interface UseShipmentsResult {
  items: Shipment[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useShipments({
  clientSearch,
  vesselSearch,
  dateFrom,
  dateTo,
  status,
}: UseShipmentsOptions): UseShipmentsResult {
  const [items, setItems] = useState<Shipment[]>([]);
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

    fetchShipments({ clientSearch, vesselSearch, dateFrom, dateTo, status })
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
  }, [clientSearch, vesselSearch, dateFrom, dateTo, status, version]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    setIsLoadingMore(true);

    fetchShipments({ clientSearch, vesselSearch, dateFrom, dateTo, status, after: endCursor })
      .then((page) => {
        setItems((prev) => [...prev, ...page.items]);
        setHasNextPage(page.hasNextPage);
        setEndCursor(page.endCursor);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoadingMore(false));
  }, [clientSearch, vesselSearch, dateFrom, dateTo, status, endCursor, hasNextPage, isLoadingMore]);

  return { items, isLoading, isError, hasNextPage, isLoadingMore, loadMore, refetch };
}
