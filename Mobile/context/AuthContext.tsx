import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

import { API_BASE_URL } from "@/lib/constants";

const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Hermes (React Native's JS engine) doesn't provide atob/Buffer by default,
// so JWT payload decoding needs a pure-JS base64 decoder instead of the
// browser-only atob() the dashboard's web AuthContext relies on.
function base64Decode(input: string): string {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";

  let output = "";
  let buffer = 0;
  let bits = 0;
  for (const char of str) {
    if (char === "=") break;
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(base64Decode(token.split(".")[1]));
  } catch {
    return {};
  }
}

function getAccessTokenExpiry(token: string): number {
  const payload = decodeJwtPayload(token);
  return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
}

function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  // .NET maps ClaimTypes.NameIdentifier to this URI, fallback to sub/nameid
  return (
    (payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] as string) ||
    (payload["sub"] as string) ||
    (payload["nameid"] as string) ||
    null
  );
}

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function clearStoredTokens(): Promise<void> {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
  await SecureStore.deleteItemAsync("refresh_token_expiry");
  await SecureStore.deleteItemAsync("user_id");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshExpiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<AuthState>({
    accessToken: null,
    userId: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const clearTimers = useCallback(() => {
    if (accessRefreshTimerRef.current) clearTimeout(accessRefreshTimerRef.current);
    if (refreshExpiryTimerRef.current) clearTimeout(refreshExpiryTimerRef.current);
  }, []);

  const logout = useCallback(async () => {
    clearTimers();
    await clearStoredTokens();
    setState({
      accessToken: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.replace("/(auth)/login");
  }, [clearTimers]);

  // Schedules a timer to logout when the refresh token expires.
  // refreshTokenExpiry is an absolute timestamp in ms.
  const scheduleRefreshTokenExpiry = useCallback(
    (refreshTokenExpiry: number) => {
      if (refreshExpiryTimerRef.current) clearTimeout(refreshExpiryTimerRef.current);

      const delay = refreshTokenExpiry - Date.now();
      if (delay <= 0) {
        void logout();
        return;
      }

      refreshExpiryTimerRef.current = setTimeout(() => {
        void logout();
      }, delay);
    },
    [logout],
  );

  // Performs the actual POST /tokens/generate call and stores the rotated
  // tokens. Returns the new pair on success, or null on failure (after
  // already calling logout()). Declared before scheduleAccessRefresh, which
  // calls it, and itself does NOT call scheduleAccessRefresh back — callers
  // reschedule using the returned tokens — so there's no circular dependency
  // between the two useCallbacks (same pattern proven on the dashboard).
  const tryImmediateRefresh = useCallback(
    async (
      refreshToken: string,
      userId: string,
    ): Promise<{ accessToken: string; refreshToken: string; refreshExpiry: number } | null> => {
      try {
        const res = await fetch(`${API_BASE_URL}/tokens/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, refreshTokenString: refreshToken }),
        });

        if (!res.ok) {
          await logout();
          return null;
        }

        // Wire shape is access_Token/refresh_Token (camelCase-first-letter),
        // not Access_Token/Refresh_Token — see lib/api.ts's tryRefreshToken
        // for the full explanation; same backend, same serializer.
        const data: { access_Token: string; refresh_Token: string } = await res.json();

        const newRefreshExpiry = Date.now() + REFRESH_TOKEN_LIFETIME_MS;

        await SecureStore.setItemAsync("access_token", data.access_Token);
        await SecureStore.setItemAsync("refresh_token", data.refresh_Token);
        await SecureStore.setItemAsync("refresh_token_expiry", String(newRefreshExpiry));
        await SecureStore.setItemAsync("user_id", userId);

        setState({
          accessToken: data.access_Token,
          userId,
          isAuthenticated: true,
          isLoading: false,
        });

        return {
          accessToken: data.access_Token,
          refreshToken: data.refresh_Token,
          refreshExpiry: newRefreshExpiry,
        };
      } catch {
        await logout();
        return null;
      }
    },
    [logout],
  );

  // Schedules a silent access token refresh 1 minute before it expires.
  const scheduleAccessRefresh = useCallback(
    (accessToken: string, refreshToken: string, userId: string) => {
      if (accessRefreshTimerRef.current) clearTimeout(accessRefreshTimerRef.current);

      const accessExpiry = getAccessTokenExpiry(accessToken);
      const delay = accessExpiry - Date.now() - 60_000; // 1 min early

      const refreshAndReschedule = async () => {
        const result = await tryImmediateRefresh(refreshToken, userId);
        if (!result) return; // tryImmediateRefresh already called logout()

        scheduleAccessRefresh(result.accessToken, result.refreshToken, userId);
        scheduleRefreshTokenExpiry(result.refreshExpiry);
      };

      if (delay <= 0) {
        // Already at/past the 1-min-early threshold — refresh now instead of
        // forcing a logout.
        void refreshAndReschedule();
        return;
      }

      accessRefreshTimerRef.current = setTimeout(() => {
        void refreshAndReschedule();
      }, delay);
    },
    [scheduleRefreshTokenExpiry, tryImmediateRefresh],
  );

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error("Invalid username or password");
    }

    // Same access_Token/refresh_Token wire-casing as /tokens/generate.
    const data: { access_Token: string; refresh_Token: string } = await res.json();

    const userId = getUserIdFromToken(data.access_Token);
    if (!userId) {
      throw new Error("Could not read user from access token");
    }

    const refreshTokenExpiry = Date.now() + REFRESH_TOKEN_LIFETIME_MS;

    await SecureStore.setItemAsync("access_token", data.access_Token);
    await SecureStore.setItemAsync("refresh_token", data.refresh_Token);
    await SecureStore.setItemAsync("refresh_token_expiry", String(refreshTokenExpiry));
    await SecureStore.setItemAsync("user_id", userId);

    setState({
      accessToken: data.access_Token,
      userId,
      isAuthenticated: true,
      isLoading: false,
    });

    scheduleAccessRefresh(data.access_Token, data.refresh_Token, userId);
    scheduleRefreshTokenExpiry(refreshTokenExpiry);
  }, [scheduleAccessRefresh, scheduleRefreshTokenExpiry]);

  // Restore session on app start.
  useEffect(() => {
    (async () => {
      const accessToken = await SecureStore.getItemAsync("access_token");
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      const refreshTokenExpiry = Number(
        (await SecureStore.getItemAsync("refresh_token_expiry")) ?? 0,
      );

      if (!accessToken || !refreshToken) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Refresh token expired — nothing we can do
      if (refreshTokenExpiry && refreshTokenExpiry <= Date.now()) {
        await clearStoredTokens();
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const userId =
        getUserIdFromToken(accessToken) || (await SecureStore.getItemAsync("user_id"));

      if (!userId) {
        await clearStoredTokens();
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const accessExpired = getAccessTokenExpiry(accessToken) <= Date.now();

      if (accessExpired) {
        // Access token expired but refresh token still valid — refresh now.
        const result = await tryImmediateRefresh(refreshToken, userId);
        if (result) {
          scheduleAccessRefresh(result.accessToken, result.refreshToken, userId);
          scheduleRefreshTokenExpiry(result.refreshExpiry);
        }
        return;
      }

      setState({
        accessToken,
        userId,
        isAuthenticated: true,
        isLoading: false,
      });

      scheduleAccessRefresh(accessToken, refreshToken, userId);
      if (refreshTokenExpiry) scheduleRefreshTokenExpiry(refreshTokenExpiry);
    })();
    // Mount-only restore — intentionally not re-running when these
    // (referentially stable) callbacks change identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
