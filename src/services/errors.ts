import type { UpstreamError } from "../external/errors";

export type ServiceError =
  | "not_found"
  | "resource_mismatch"
  | "upstream_unavailable"
  | "upstream_error"
  | "upstream_invalid_payload";

export function mapUpstreamToServiceError(err: UpstreamError): ServiceError {
  switch (err) {
    case "not_found":
      return "not_found";
    case "unavailable":
      return "upstream_unavailable";
    case "error":
      return "upstream_error";
    default: {
      const _exhaustive: never = err;
      return _exhaustive;
    }
  }
}
