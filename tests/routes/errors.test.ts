import { describe, expect, test } from 'vitest';

import { HTTP_STATUS_BY_ERROR, toJsonErrorResponse } from '../../src/routes/errors';

describe('routes/errors.toJsonErrorResponse', () => {
  const cases = Object.entries(
    HTTP_STATUS_BY_ERROR,
  ) as [keyof typeof HTTP_STATUS_BY_ERROR, number][];
  for (const [err, status] of cases) {
    test(`${err} -> status ${status} and body.error`, async () => {
      const res = toJsonErrorResponse(err);
      expect(res.status).toBe(status);
      const body = await res.json();
      expect(body).toStrictEqual({ error: err });
    });
  }
});
