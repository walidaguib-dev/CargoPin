"use client";

import { useEffect, useState } from "react";

/** Debounces a value by `delay` ms — re-renders only when the debounced
 * value settles, so we don't fire a network request per keystroke. */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
