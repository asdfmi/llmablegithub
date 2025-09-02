import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../../src/external/http', () => ({
  fetchJson: vi.fn(),
}));

import { fetchIssue, fetchIssueComments } from '../../../src/external/github/client';
import { fetchJson } from '../../../src/external/http';

const asMock = <T extends (...args: any[]) => any>(
  fn: T,
) => fn as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  asMock(fetchJson).mockReset();
});

describe('external/github/client.fetchIssue', () => {
  test('success path returns ok and correct URL is used', async () => {
    asMock(fetchJson).mockResolvedValueOnce({ ok: true, value: { number: 123 } });
    const res = await fetchIssue('o', 'r', 123);
    expect(res.ok).toBe(true);
    expect(asMock(fetchJson)).toHaveBeenCalledTimes(1);
    const url = asMock(fetchJson).mock.calls[0]![0];
    expect(url).toBe('https://api.github.com/repos/o/r/issues/123');
  });

  test('404 maps to not_found', async () => {
    asMock(fetchJson).mockResolvedValueOnce({ ok: false, error: 404 });
    const res = await fetchIssue('o', 'r', 1);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('not_found');
  });

  test('403/429 map to unavailable; other -> error', async () => {
    asMock(fetchJson).mockResolvedValueOnce({ ok: false, error: 403 });
    const r1 = await fetchIssue('o', 'r', 1);
    expect(!r1.ok && r1.error === 'unavailable').toBe(true);

    asMock(fetchJson).mockResolvedValueOnce({ ok: false, error: 429 });
    const r2 = await fetchIssue('o', 'r', 1);
    expect(!r2.ok && r2.error === 'unavailable').toBe(true);

    asMock(fetchJson).mockResolvedValueOnce({ ok: false, error: 500 });
    const r3 = await fetchIssue('o', 'r', 1);
    expect(!r3.ok && r3.error === 'error').toBe(true);
  });
});

describe('external/github/client.fetchIssueComments', () => {
  test('success path returns ok and URL includes per_page=100', async () => {
    asMock(fetchJson).mockResolvedValueOnce({ ok: true, value: [] });
    const res = await fetchIssueComments('o', 'r', 2);
    expect(res.ok).toBe(true);
    expect(asMock(fetchJson)).toHaveBeenCalledTimes(1);
    const url = asMock(fetchJson).mock.calls[0]![0];
    expect(url).toBe('https://api.github.com/repos/o/r/issues/2/comments?per_page=100');
  });

  test('error statuses are mapped like fetchIssue', async () => {
    asMock(fetchJson).mockResolvedValueOnce({ ok: false, error: 404 });
    const r1 = await fetchIssueComments('o', 'r', 2);
    expect(!r1.ok && r1.error === 'not_found').toBe(true);

    asMock(fetchJson).mockResolvedValueOnce({ ok: false, error: 403 });
    const r2 = await fetchIssueComments('o', 'r', 2);
    expect(!r2.ok && r2.error === 'unavailable').toBe(true);

    asMock(fetchJson).mockResolvedValueOnce({ ok: false, error: 500 });
    const r3 = await fetchIssueComments('o', 'r', 2);
    expect(!r3.ok && r3.error === 'error').toBe(true);
  });
});
