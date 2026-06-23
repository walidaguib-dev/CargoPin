"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

const MIN_SEARCH_LENGTH = 2;

export interface SearchableSelectOption {
  id: number;
  label: string;
}

interface SearchableSelectFetchResult<T> {
  items: T[];
  hasMore: boolean;
}

interface SearchableSelectProps<T> {
  id?: string;
  selectedLabel: string | null;
  onSelect: (option: SearchableSelectOption | null) => void;
  fetchOptions: (search: string) => Promise<SearchableSelectFetchResult<T>>;
  mapToOption: (item: T) => SearchableSelectOption;
  renderOption: (item: T) => React.ReactNode;
  placeholder: string;
  hasError?: boolean;
}

// Generic combobox: a text input that filters a dropdown as the user types, used by
// ClientSelect/VesselSelect/MerchandiseSelect. No cmdk/combobox primitive exists in
// this project (checked components/ui/ and package.json), so this is the "Option B"
// custom build called out in the task — controlled search input, debounced fetch,
// absolutely-positioned dropdown, click-outside-to-close via a ref + listener.
export function SearchableSelect<T>({
  id,
  selectedLabel,
  onSelect,
  fetchOptions,
  mapToOption,
  renderOption,
  placeholder,
  hasError,
}: SearchableSelectProps<T>) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (debouncedSearch.trim().length < MIN_SEARCH_LENGTH) {
      setOptions([]);
      setHasMore(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchOptions(debouncedSearch.trim())
      .then((result) => {
        if (cancelled) return;
        setOptions(result.items);
        setHasMore(result.hasMore);
      })
      .catch(() => {
        if (cancelled) return;
        setOptions([]);
        setHasMore(false);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, fetchOptions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePick = (item: T) => {
    onSelect(mapToOption(item));
    setSearch("");
    setOptions([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearch("");
    setOptions([]);
  };

  const showDropdown = isOpen && search.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      {selectedLabel ? (
        <div
          className={`mt-1.5 flex h-11 items-center justify-between rounded-lg border bg-[#F0F9FF] px-3 text-[14px] ${
            hasError ? "border-destructive" : "border-[#BAE6FD]"
          }`}
        >
          <span className="truncate font-medium text-[#0C4A6E]">{selectedLabel}</span>
          <button
            type="button"
            aria-label="Clear selection"
            onClick={handleClear}
            className="shrink-0 rounded-md p-1 text-[#0C4A6E] hover:bg-[#E0F2FE]"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative mt-1.5">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <Input
            id={id}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            aria-invalid={hasError ? true : undefined}
            className={`h-11 border-[#E2E8F0] pl-9 text-[14px] focus-visible:ring-[#0EA5E9] ${
              hasError ? "border-destructive" : ""
            }`}
          />
        </div>
      )}

      {showDropdown && !selectedLabel ? (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
          {search.trim().length < MIN_SEARCH_LENGTH ? (
            <div className="px-3 py-2.5 text-[13px] text-[#94A3B8]">
              Type at least {MIN_SEARCH_LENGTH} characters to search
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-[#64748B]">
              <Loader2 size={14} className="animate-spin" />
              Searching...
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2.5 text-[13px] text-[#94A3B8]">No results found</div>
          ) : (
            <>
              <ul className="max-h-56 overflow-y-auto py-1">
                {options.map((item) => {
                  const option = mapToOption(item);
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => handlePick(item)}
                        className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[14px] hover:bg-[#F1F5F9]"
                      >
                        {renderOption(item)}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {hasMore ? (
                <div className="border-t border-[#E2E8F0] px-3 py-2 text-[12px] text-[#94A3B8]">
                  More results available — refine your search to narrow down
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
