import type { Result } from "../shared/result";

// Generic fetcher for external APIs.
// - Maps network failure → 502
// - 404 passthrough → 404
// - Other non-2xx → upstream status code
// - JSON parse errors → 502
// - Optional validator gates the minimal expected shape
export async function fetchJson(
  url: string,
  init?: RequestInit,
  validate?: (data: unknown) => boolean,
  fetchFn: typeof fetch = fetch
): Promise<Result<unknown, number>> {
  let res: Response;
  try {
    res = await fetchFn(url, init);
  } catch {
    return { ok: false, error: 502 };
  }
  if (res.status === 404) return { ok: false, error: 404 };
  if (!res.ok) return { ok: false, error: res.status };

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { ok: false, error: 502 };
  }

  if (validate && !validate(json)) return { ok: false, error: 502 };
  return { ok: true, value: json };
}
