const AUTH_STORAGE_KEYS = [
  "access_token",
  "refresh_token",
  "refresh_token_expiry",
  "user_id",
];

function clearAuthCookie(): void {
  document.cookie = "auth_session=; path=/; max-age=0; SameSite=Strict";
}

/** Clears client-side auth state and redirects to login.
 * No backend revoke/logout endpoint exists yet (AuthEndpoints.cs and
 * TokensEndpoints.cs only expose register/signin/generate), so this
 * only clears local state — nothing to silently fail against. */
export function logout(): void {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  clearAuthCookie();

  window.location.href = "/auth/login";
}
