import type { ServiceError } from "../services/errors";

export const HTTP_STATUS_BY_ERROR = {
  not_found: 404,
  resource_mismatch: 409,
  upstream_unavailable: 503,
  upstream_invalid_payload: 502,
  upstream_error: 502,
} as const satisfies Record<ServiceError, number>;

export const httpStatusByServiceError = (e: ServiceError): number => HTTP_STATUS_BY_ERROR[e];

export type ErrorBody = { error: ServiceError };

export function toJsonErrorResponse(e: ServiceError): Response {
  return Response.json({ error: e } satisfies ErrorBody, { status: httpStatusByServiceError(e) });
}
