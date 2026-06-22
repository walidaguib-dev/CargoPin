import type { CreateMerchandiseDto, UpdateMerchandiseDto } from "./types";

// Backend/API/Routes/MerchandisesEndpoints.cs maps these under app.MapGroup("/api/merchandises"),
// and NEXT_PUBLIC_API_URI is assumed to already include the "/api" segment — the same
// assumption the existing login/register pages make (they call `${NEXT_PUBLIC_API_URI}/auth/signin`
// against a backend group mounted at "/api/auth").
const API_BASE = `${process.env.NEXT_PUBLIC_API_URI}/merchandises`;

export interface ApiFieldError {
  field: string;
  message: string;
}

// Thrown when the backend's global exception handler returns a FluentValidation
// failure shaped as `{ errors: [{ field, message }] }` (see
// Backend/API/middlewares/ExceptionsHandler.cs).
export class ApiValidationError extends Error {
  fieldErrors: ApiFieldError[];

  constructor(fieldErrors: ApiFieldError[]) {
    super("Validation failed");
    this.name = "ApiValidationError";
    this.fieldErrors = fieldErrors;
  }
}

function authHeaders(accessToken: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
}

async function throwOnError(res: Response): Promise<never> {
  if (res.status === 400) {
    const body = await res.json().catch(() => null);
    if (body?.errors) {
      throw new ApiValidationError(body.errors as ApiFieldError[]);
    }
  }
  throw new Error(`Request failed with status ${res.status}`);
}

export async function createMerchandise(
  dto: CreateMerchandiseDto,
  accessToken: string | null,
): Promise<void> {
  const res = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(dto),
  });
  if (!res.ok) await throwOnError(res);
}

export async function updateMerchandise(
  id: number,
  dto: UpdateMerchandiseDto,
  accessToken: string | null,
): Promise<void> {
  const res = await fetch(`${API_BASE}/update/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(dto),
  });
  if (!res.ok) await throwOnError(res);
}

export async function deleteMerchandise(
  id: number,
  accessToken: string | null,
): Promise<void> {
  const res = await fetch(`${API_BASE}/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
  if (!res.ok) await throwOnError(res);
}
