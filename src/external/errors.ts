export type UpstreamError =
  | "not_found"
  | "unavailable"
  | "error";

export function mapHttpStatusToUpstreamError(status: number): UpstreamError {
  if (status === 404) return "not_found";
  if (status === 403 || status === 429) return "unavailable";
  return "error";
}
