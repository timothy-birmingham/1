/** Thin fetch wrapper for client components: parses JSON, and on a non-2xx
 * response throws an Error whose message is the API's `error` field (falling
 * back to the status text) so callers can show it directly in a toast. */
export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && String(body.error)) ||
      res.statusText ||
      "Request failed";
    throw new Error(message);
  }

  return body as T;
}
