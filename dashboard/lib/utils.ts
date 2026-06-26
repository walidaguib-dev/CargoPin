import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The very first request a page makes after a hard load occasionally fails
// while the API connection is still warming up, even though every subsequent
// request (including a fresh remount) succeeds immediately — retrying once
// clears that without ever surfacing an error to the user.
export async function withRetry<T>(fn: () => Promise<T>, retries = 1, delayMs = 800): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    return withRetry(fn, retries - 1, delayMs)
  }
}
