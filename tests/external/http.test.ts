import { describe, expect, test } from 'vitest';

import { fetchJson } from '../../src/external/http';

const okResponse = (body: any, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

describe('external/http.fetchJson', () => {
  test('returns 502 on network error (fetch throws)', async () => {
    const fetchFn = () => Promise.reject(new Error('network'));
    const res = await fetchJson('https://example.com', {}, undefined, fetchFn as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe(502);
  });

  test('passes through 404 as error 404', async () => {
    const fetchFn = () => Promise.resolve(new Response('', { status: 404 }));
    const res = await fetchJson('https://example.com', {}, undefined, fetchFn as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe(404);
  });

  test('non-2xx becomes error with that status', async () => {
    const fetchFn = () => Promise.resolve(new Response('', { status: 500 }));
    const res = await fetchJson('https://example.com', {}, undefined, fetchFn as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe(500);
  });

  test('JSON parse failures return 502', async () => {
    const fetchFn = () => Promise.resolve(
      new Response('not json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const res = await fetchJson('https://example.com', {}, undefined, fetchFn as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe(502);
  });

  test('validator gate: false -> 502', async () => {
    const fetchFn = () => Promise.resolve(okResponse({ a: 1 }));
    const res = await fetchJson('https://example.com', {}, () => false, fetchFn as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe(502);
  });

  test('happy path without validator', async () => {
    const payload = { hello: 'world' };
    const fetchFn = () => Promise.resolve(okResponse(payload));
    const res = await fetchJson('https://example.com', {}, undefined, fetchFn as any);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value).toStrictEqual(payload);
  });

  test('happy path with validator true', async () => {
    const payload = { id: 1 };
    const fetchFn = () => Promise.resolve(okResponse(payload));
    const res = await fetchJson(
      'https://example.com',
      {},
      (d) => typeof (d as any).id === 'number',
      fetchFn as any,
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value).toStrictEqual(payload);
  });
});
