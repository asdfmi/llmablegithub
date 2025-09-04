import { describe, expect, test } from 'vitest';

import { registerHealthRoute } from '../../src/routes/health';
import type { RouterHandler, RouterLike } from '../../src/routes/types';

const makeStubRouter = () => {
  let pathRegistered: string | null = null;
  let handler: RouterHandler | null = null;
  const router: RouterLike = {
    get: (path: string, h: RouterHandler) => {
      pathRegistered = path;
      handler = h;
      return undefined as any;
    },
  };
  return { router, get path() { return pathRegistered!; }, get handler() { return handler!; } };
};

describe('routes/health.registerHealthRoute', () => {
  test('registers GET /health and returns ok: true', async () => {
    const stub = makeStubRouter();
    registerHealthRoute(stub.router);

    expect(stub.path).toBe('/health');
    const res = await stub.handler(new Request('https://example.com/health'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toStrictEqual({ ok: true });
  });
});
