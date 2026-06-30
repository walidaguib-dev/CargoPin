import * as SecureStore from "expo-secure-store";

import { API_BASE_URL } from "./constants";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = await SecureStore.getItemAsync("access_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) throw new Error("Unauthorized");

    const newToken = await SecureStore.getItemAsync("access_token");
    const retry = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      },
    });
    if (!retry.ok) throw new Error("Request failed");
    return parseJsonBody<T>(retry);
  }

  if (!response.ok) {
    const error = await parseJsonBody<{ message?: string }>(response).catch(
      () => ({ message: undefined }),
    );
    throw new Error(error.message || "Request failed");
  }

  return parseJsonBody<T>(response);
}

// Some endpoints (e.g. POST /api/auth/register, which returns 201 Created
// with no body) respond with an empty body — response.json() throws on
// that ("Unexpected end of JSON input"), which would make a successful
// request look like a failure to every caller.
async function parseJsonBody<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    const userId = await SecureStore.getItemAsync("user_id");
    if (!refreshToken || !userId) return false;

    const res = await fetch(`${API_BASE_URL}/tokens/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, refreshTokenString: refreshToken }),
    });

    if (!res.ok) return false;

    // ASP.NET Core's default minimal-API JSON serializer (JsonSerializerDefaults.Web)
    // lowercases only the first letter of Access_Token/Refresh_Token, so the wire
    // shape is access_Token/refresh_Token — not Access_Token/Refresh_Token. Confirmed
    // against the live backend; this exact casing bug already broke the dashboard's
    // equivalent refresh call.
    const data: { access_Token: string; refresh_Token: string } = await res.json();
    await SecureStore.setItemAsync("access_token", data.access_Token);
    await SecureStore.setItemAsync("refresh_token", data.refresh_Token);
    return true;
  } catch {
    return false;
  }
}
