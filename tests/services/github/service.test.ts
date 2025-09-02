import { describe, expect, test } from 'vitest';

import type { GitHubPort } from '../../../src/services/github/service';
import { getLLMableIssueResponse } from '../../../src/services/github/service';

const issueOk = {
  number: 10,
  title: 'Title',
  state: 'open',
  body: 'Body',
  comments: 2,
  html_url: 'https://github.com/o/r/issues/10',
  created_at: '2024-01-01T00:00:00Z',
  user: { login: 'alice' },
  labels: ['bug', { name: 'x' }],
  assignees: [{ login: 'bob' }],
} as any;

const commentsOk = [
  { user: { login: 'bob' }, body: 'c1', created_at: '2024-01-02T00:00:00Z' },
  { user: { login: 'carol' }, body: 'c2', created_at: '2024-01-03T00:00:00Z' },
] as any[];

const makePort = (over: Partial<GitHubPort>): GitHubPort => ({
  fetchIssue: () => Promise.resolve({ ok: true, value: issueOk }),
  fetchIssueComments: () => Promise.resolve({ ok: true, value: commentsOk }),
  ...over,
});

describe('services/github/service.getLLMableIssueResponse', () => {
  test('happy path returns LLMableIssue with projected fields', async () => {
    const port = makePort({});
    const res = await getLLMableIssueResponse('o', 'r', 10, port);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.source).toStrictEqual({
      owner: 'o',
      repo: 'r',
      issue_number: 10,
      html_url: issueOk.html_url,
    });
    expect(res.value.issue.title).toBe('Title');
    expect(res.value.issue.author).toBe('alice');
    expect(res.value.content.body_markdown).toBe('Body');
    expect(res.value.comments.total_count).toBe(2);
    expect(res.value.comments.items.length).toBe(2);
  });

  test('PR resource returns resource_mismatch', async () => {
    const port = makePort({
      fetchIssue: () =>
        Promise.resolve({ ok: true, value: { ...issueOk, pull_request: {} } }),
    });
    const res = await getLLMableIssueResponse('o', 'r', 10, port);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('resource_mismatch');
  });

  test('maps upstream fetchIssue errors', async () => {
    const res1 = await getLLMableIssueResponse(
      'o',
      'r',
      10,
      makePort({ fetchIssue: () => Promise.resolve({ ok: false, error: 'not_found' }) as any }),
    );
    expect(res1.ok).toBe(false); if (!res1.ok) expect(res1.error).toBe('not_found');

    const res2 = await getLLMableIssueResponse(
      'o',
      'r',
      10,
      makePort({ fetchIssue: () => Promise.resolve({ ok: false, error: 'unavailable' }) as any }),
    );
    expect(res2.ok).toBe(false); if (!res2.ok) expect(res2.error).toBe('upstream_unavailable');

    const res3 = await getLLMableIssueResponse(
      'o',
      'r',
      10,
      makePort({ fetchIssue: () => Promise.resolve({ ok: false, error: 'error' }) as any }),
    );
    expect(res3.ok).toBe(false); if (!res3.ok) expect(res3.error).toBe('upstream_error');
  });

  test('invalid issue payload becomes upstream_invalid_payload', async () => {
    const port = makePort({ fetchIssue: () => Promise.resolve({ ok: true, value: {} }) as any });
    const res = await getLLMableIssueResponse('o', 'r', 10, port);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('upstream_invalid_payload');
  });

  test('comments not_found tolerated; falls back to empty items and count from issue', async () => {
    const port = makePort({
      fetchIssueComments: () =>
        Promise.resolve({ ok: false, error: 'not_found' }) as any,
    });
    const res = await getLLMableIssueResponse('o', 'r', 10, port);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.comments.items.length).toBe(0);
    expect(res.value.comments.total_count).toBe(2);
  });

  test('comments upstream failures map to service errors', async () => {
    const res1 = await getLLMableIssueResponse(
      'o',
      'r',
      10,
      makePort({
        fetchIssueComments: () =>
          Promise.resolve({ ok: false, error: 'unavailable' }) as any,
      }),
    );
    expect(res1.ok).toBe(false); if (!res1.ok) expect(res1.error).toBe('upstream_unavailable');

    const res2 = await getLLMableIssueResponse(
      'o',
      'r',
      10,
      makePort({
        fetchIssueComments: () =>
          Promise.resolve({ ok: false, error: 'error' }) as any,
      }),
    );
    expect(res2.ok).toBe(false); if (!res2.ok) expect(res2.error).toBe('upstream_error');
  });

  test('invalid comments payload becomes upstream_invalid_payload', async () => {
    const port = makePort({
      fetchIssueComments: () =>
        Promise.resolve({ ok: true, value: [{}] }) as any,
    });
    const res = await getLLMableIssueResponse('o', 'r', 10, port);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('upstream_invalid_payload');
  });
});
