import { describe, expect, test, vi } from 'vitest';

const makeReq = (path: string, method = 'GET') =>
  new Request(`https://example.com${path}`, { method });

describe('routes/router fallback (unit by stubbing itty-router)', () => {
  test('unknown path falls through to 404 not_found', async () => {
    let capturedAll: ((req: Request) => Promise<Response> | Response) | undefined;

    vi.doMock('itty-router', () => ({
      Router: () => ({
        get: (_p: string, _h: (req: Request) => Promise<Response> | Response) => undefined,
        all: (_p: string, h: (req: Request) => Promise<Response> | Response) => {
          capturedAll = h;
          return undefined;
        },
      }),
    }));

    const { buildRouter } = await import('../../src/routes/router');
    buildRouter(); // registers fallback via router.all('*', ...)

    expect(typeof capturedAll).toBe('function');
    const res = await capturedAll!(makeReq('/no/such/path'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toStrictEqual({ error: 'not_found' });
  });
});
