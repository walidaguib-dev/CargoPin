"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // seconds

function setAuthCookie() {
  document.cookie = `auth_session=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
}

function clearAuthCookie() {
  document.cookie = "auth_session=; path=/; max-age=0; SameSite=Strict";
}

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
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
  // .NET maps ClaimTypes.NameIdentifier to this URI, fallback to sub
  return (
    (payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] as string) ||
    (payload["sub"] as string) ||
    (payload["nameid"] as string) ||
    null
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Timer that fires 1 minute before access token expiry to silently refresh
  const accessRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timer that fires exactly when the refresh token expires to force logout
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

  const logout = useCallback(() => {
    clearTimers();
    clearAuthCookie();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("refresh_token_expiry");
    localStorage.removeItem("user_id");
    setState({
      accessToken: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/auth/login");
  }, [clearTimers, router]);

  // Schedules a timer to logout when the refresh token expires.
  // refreshTokenExpiry is an absolute timestamp in ms.
  const scheduleRefreshTokenExpiry = useCallback(
    (refreshTokenExpiry: number) => {
      if (refreshExpiryTimerRef.current) clearTimeout(refreshExpiryTimerRef.current);

      const delay = refreshTokenExpiry - Date.now();
      if (delay <= 0) {
        logout();
        return;
      }

      refreshExpiryTimerRef.current = setTimeout(() => {
        logout();
      }, delay);
    },
    [logout],
  );

  // Schedules a silent access token refresh 1 minute before it expires.
  // On success the backend rotates the refresh token, so we store both new tokens
  // and reset the 7-day expiry window.
  const scheduleAccessRefresh = useCallback(
    (accessToken: string, refreshToken: string, userId: string) => {
      if (accessRefreshTimerRef.current) clearTimeout(accessRefreshTimerRef.current);

      const accessExpiry = getAccessTokenExpiry(accessToken);
      const delay = accessExpiry - Date.now() - 60_000; // 1 min early

      if (delay <= 0) {
        logout();
        return;
      }

      accessRefreshTimerRef.current = setTimeout(async () => {
        // Bail out if the refresh token already expired before we fire
        const storedExpiry = Number(localStorage.getItem("refresh_token_expiry") ?? 0);
        if (storedExpiry && storedExpiry <= Date.now()) {
          logout();
          return;
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URI}/tokens/generate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, refreshTokenString: refreshToken }),
            },
          );

          if (!res.ok) throw new Error("Refresh failed");

          const data: { Access_Token: string; Refresh_Token: string } =
            await res.json();

          const newRefreshExpiry = Date.now() + REFRESH_TOKEN_LIFETIME_MS;

          localStorage.setItem("access_token", data.Access_Token);
          localStorage.setItem("refresh_token", data.Refresh_Token);
          localStorage.setItem("refresh_token_expiry", String(newRefreshExpiry));

          setState((prev) => ({ ...prev, accessToken: data.Access_Token }));

          scheduleAccessRefresh(data.Access_Token, data.Refresh_Token, userId);
          scheduleRefreshTokenExpiry(newRefreshExpiry);
        } catch {
          logout();
        }
      }, delay);
    },
    [logout, scheduleRefreshTokenExpiry],
  );

  const login = useCallback(
    (accessToken: string, refreshToken: string) => {
      const userId = getUserIdFromToken(accessToken);
      const refreshTokenExpiry = Date.now() + REFRESH_TOKEN_LIFETIME_MS;

      setAuthCookie();
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("refresh_token_expiry", String(refreshTokenExpiry));
      if (userId) localStorage.setItem("user_id", userId);

      setState({
        accessToken,
        userId,
        isAuthenticated: true,
        isLoading: false,
      });

      if (userId) {
        scheduleAccessRefresh(accessToken, refreshToken, userId);
        scheduleRefreshTokenExpiry(refreshTokenExpiry);
      }
    },
    [scheduleAccessRefresh, scheduleRefreshTokenExpiry],
  );

  // Restore session on mount.
  // If the access token is expired but the refresh token is still valid,
  // silently refresh immediately — the endpoint no longer requires [Authorize].
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const refreshTokenExpiry = Number(
      localStorage.getItem("refresh_token_expiry") ?? 0,
    );

    const clear = () => {
      clearAuthCookie();
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("refresh_token_expiry");
      localStorage.removeItem("user_id");
      setState({
        accessToken: null,
        userId: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    if (!accessToken || !refreshToken) {
      clearAuthCookie();
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Refresh token expired — nothing we can do
    if (refreshTokenExpiry && refreshTokenExpiry <= Date.now()) {
      clear();
      return;
    }

    const userId =
      getUserIdFromToken(accessToken) || localStorage.getItem("user_id");

    if (!userId) {
      clear();
      return;
    }

    const accessExpired = getAccessTokenExpiry(accessToken) <= Date.now();

    if (accessExpired) {
      // Access token expired but refresh token is still valid — refresh immediately
      fetch(`${process.env.NEXT_PUBLIC_API_URI}/tokens/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, refreshTokenString: refreshToken }),
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json() as Promise<{
            Access_Token: string;
            Refresh_Token: string;
          }>;
        })
        .then((data) => {
          const newRefreshExpiry = Date.now() + REFRESH_TOKEN_LIFETIME_MS;
          setAuthCookie();
          localStorage.setItem("access_token", data.Access_Token);
          localStorage.setItem("refresh_token", data.Refresh_Token);
          localStorage.setItem(
            "refresh_token_expiry",
            String(newRefreshExpiry),
          );
          setState({
            accessToken: data.Access_Token,
            userId,
            isAuthenticated: true,
            isLoading: false,
          });
          scheduleAccessRefresh(data.Access_Token, data.Refresh_Token, userId);
          scheduleRefreshTokenExpiry(newRefreshExpiry);
        })
        .catch(clear);

      return;
    }

    // Access token still valid — restore session and start timers
    setAuthCookie();
    setState({
      accessToken,
      userId,
      isAuthenticated: true,
      isLoading: false,
    });

    scheduleAccessRefresh(accessToken, refreshToken, userId);
    if (refreshTokenExpiry) scheduleRefreshTokenExpiry(refreshTokenExpiry);
  }, [scheduleAccessRefresh, scheduleRefreshTokenExpiry]);

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
