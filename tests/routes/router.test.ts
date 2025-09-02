import { describe, expect, test } from 'vitest';

import type { ServiceFn } from '../../src/routes/github/issues';
import { buildRouter } from '../../src/routes/router';

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: any };

const makeReq = (path: string, method = 'GET') =>
  new Request(`https://example.com${path}`, { method });

describe.skip('routes/router + github/issues route', () => {
  test('happy path: returns JSON from injected service', async () => {
    const value = { hello: 'world' };
    const svc: ServiceFn<typeof value> = () =>
      Promise.resolve({ ok: true as const, value });
    const router = buildRouter(svc);
    const res = await (router as any)['handle'](makeReq('/o/r/issues/1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toStrictEqual(value);
  });

  test('invalid params return 404 not_found', async () => {
    const svc: ServiceFn<any> = () => Promise.resolve({ ok: true, value: {} });
    const router = buildRouter(svc);
    const res = await (router as any)['handle'](makeReq('/o/r/issues/not-a-number'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toStrictEqual({ error: 'not_found' });
  });

  test('service error maps to JSON error response with proper status', async () => {
    const svc: ServiceFn<any> = () =>
      Promise.resolve({ ok: false as const, error: 'upstream_unavailable' });
    const router = buildRouter(svc);
    const res = await (router as any)['handle'](makeReq('/o/r/issues/2'));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toStrictEqual({ error: 'upstream_unavailable' });
  });

  test('unknown path falls through to 404 not_found', async () => {
    const svc: ServiceFn<any> = () => Promise.resolve({ ok: true, value: {} });
    const router = buildRouter(svc);
    const res = await (router as any)['handle'](makeReq('/no/such/path'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toStrictEqual({ error: 'not_found' });
  });
});
