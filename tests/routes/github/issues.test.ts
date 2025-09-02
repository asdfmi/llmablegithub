import { describe, expect, test } from 'vitest';

import { registerGithubIssueRoutes, type ServiceFn } from '../../../src/routes/github/issues';

type Handler = (req: Request & { params?: any }) => Promise<Response> | Response;

const makeStubRouter = () => {
  let handler: Handler | null = null;
  const router = {
    get: (_path: string, h: Handler) => {
      handler = h;
      return undefined as any;
    },
  } as const;
  return { router, get handler() { return handler!; } };
};

const makeReqWithParams = (params: { owner?: string; repo?: string; number?: string }) =>
  Object.assign(new Request('https://example.com'), { params });

describe('routes/github/issues.registerGithubIssueRoutes handler', () => {
  test('valid params -> 200 with service value', async () => {
    const value = { hello: 'world' };
    const svc: ServiceFn<typeof value> = () => Promise.resolve({ ok: true, value });
    const stub = makeStubRouter();
    registerGithubIssueRoutes(stub.router, svc);

    const res = await stub.handler(makeReqWithParams({ owner: 'o', repo: 'r', number: '1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toStrictEqual(value);
  });

  test('service error -> maps to error response', async () => {
    const svc: ServiceFn<any> = () =>
      Promise.resolve({ ok: false, error: 'upstream_error' });
    const stub = makeStubRouter();
    registerGithubIssueRoutes(stub.router, svc);

    const res = await stub.handler(makeReqWithParams({ owner: 'o', repo: 'r', number: '1' }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body).toStrictEqual({ error: 'upstream_error' });
  });

  test('invalid params -> 404 not_found', async () => {
    const svc: ServiceFn<any> = () => Promise.resolve({ ok: true, value: {} });
    const stub = makeStubRouter();
    registerGithubIssueRoutes(stub.router, svc);

    const res = await stub.handler(makeReqWithParams({ owner: 'o', repo: 'r', number: 'NaN' }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toStrictEqual({ error: 'not_found' });
  });
});
