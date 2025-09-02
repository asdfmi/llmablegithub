import { describe, expect, test } from 'vitest';

import { mapUpstreamToServiceError } from '../../src/services/errors';

describe('services/errors.mapUpstreamToServiceError', () => {
  test('not_found -> not_found', () => {
    expect(mapUpstreamToServiceError('not_found')).toBe('not_found');
  });
  test('unavailable -> upstream_unavailable', () => {
    expect(mapUpstreamToServiceError('unavailable')).toBe('upstream_unavailable');
  });
  test('error -> upstream_error', () => {
    expect(mapUpstreamToServiceError('error')).toBe('upstream_error');
  });
});
