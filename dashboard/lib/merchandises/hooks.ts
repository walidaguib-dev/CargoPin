"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchMerchandise, fetchMerchandises } from "./graphql";
import type { CargoType, Merchandise } from "./types";

interface UseMerchandisesOptions {
  search?: string;
  cargoType?: CargoType;
}

interface UseMerchandisesResult {
  items: Merchandise[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useMerchandises({
  search,
  cargoType,
}: UseMerchandisesOptions): UseMerchandisesResult {
  const [items, setItems] = useState<Merchandise[]>([]);
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

    fetchMerchandises({ search, cargoType })
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
  }, [search, cargoType, version]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    setIsLoadingMore(true);

    fetchMerchandises({ search, cargoType, after: endCursor })
      .then((page) => {
        setItems((prev) => [...prev, ...page.items]);
        setHasNextPage(page.hasNextPage);
        setEndCursor(page.endCursor);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoadingMore(false));
  }, [search, cargoType, endCursor, hasNextPage, isLoadingMore]);

  return { items, isLoading, isError, hasNextPage, isLoadingMore, loadMore, refetch };
}

interface UseMerchandiseResult {
  data: Merchandise | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useMerchandise(id: number | null): UseMerchandiseResult {
  const [data, setData] = useState<Merchandise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (id === null) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    fetchMerchandise(id)
      .then((result) => {
        if (cancelled) return;
        setData(result);
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
  }, [id, version]);

  return { data, isLoading, isError, refetch };
}
