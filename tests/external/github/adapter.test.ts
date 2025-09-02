import { describe, expect, test } from 'vitest';

import { projectCommentsSubset, projectIssueSubset } from '../../../src/external/github/adapter';

describe('external/github/adapter.projectIssueSubset', () => {
  const baseRawIssue = {
    number: 42,
    title: 'Test Issue',
    state: 'open',
    body: 'Body text',
    comments: 3,
    html_url: 'https://github.com/owner/repo/issues/42',
    created_at: '2024-01-01T00:00:00Z',
    user: { login: 'alice' },
    labels: ['bug', { name: 'help wanted' }],
    assignees: [{ login: 'bob' }, { login: 'carol' }],
  } as any;

  const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

  test('maps a valid GitHub issue payload to IssueSubset', () => {
    const res = projectIssueSubset(baseRawIssue);
    expect(res.ok).toBe(true);
    if (!res.ok) return; // type guard

    expect(res.value).toStrictEqual({
      number: 42,
      title: 'Test Issue',
      state: 'open',
      author: 'alice',
      labels: ['bug', 'help wanted'],
      assignees: ['bob', 'carol'],
      created_at: '2024-01-01T00:00:00Z',
      body_markdown: 'Body text',
      html_url: 'https://github.com/owner/repo/issues/42',
      comments_total_count: 3,
    });
  });

  test('accepts labels as strings or objects with name', () => {
    const raw = clone(baseRawIssue);
    raw.labels = ['a', { name: 'b' }, 'c', { name: 'd' }];
    const res = projectIssueSubset(raw);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.labels).toStrictEqual(['a', 'b', 'c', 'd']);
  });

  test('invalid when raw is not an object', () => {
    const res = projectIssueSubset(null as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('invalid_issue.object');
  });

  test.each<[
    name: string,
    mutate: (o: any) => void,
    expectedError: string,
  ]>([
    ['missing number', (o) => delete o.number, 'invalid_issue.number'],
    ['non-string title', (o) => (o.title = 123), 'invalid_issue.title'],
    ['non-string state', (o) => (o.state = 123), 'invalid_issue.state'],
    ['non-string body', (o) => (o.body = 123), 'invalid_issue.body'],
    ['non-number comments', (o) => (o.comments = '3'), 'invalid_issue.comments'],
    ['non-string html_url', (o) => (o.html_url = 123), 'invalid_issue.html_url'],
    ['non-string created_at', (o) => (o.created_at = 123), 'invalid_issue.created_at'],
    ['user missing login', (o) => (o.user = {}), 'invalid_issue.author'],
    ['user.login not string', (o) => (o.user = { login: 1 }), 'invalid_issue.author'],
    ['labels not array', (o) => (o.labels = {}), 'invalid_issue.labels'],
    ['labels item invalid', (o) => (o.labels = [{ foo: 'x' }]), 'invalid_issue.labels_item'],
    ['assignees not array', (o) => (o.assignees = 'x'), 'invalid_issue.assignees'],
    [
      'assignees item invalid',
      (o) => (o.assignees = [{ name: 'bob' }]),
      'invalid_issue.assignees_item',
    ],
  ])('validation: %s -> %s', (_name, mutate, expectedError) => {
    const raw = clone(baseRawIssue);
    mutate(raw);
    const res = projectIssueSubset(raw);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe(expectedError);
  });
});

describe('external/github/adapter.projectCommentsSubset', () => {
  test('maps and sorts comments by created_at ascending; invalid date first', () => {
    const raw = [
      { user: { login: 'bob' }, body: 'B', created_at: '2024-01-02T00:00:00Z' },
      { user: { login: 'eve' }, body: 'X', created_at: 'not a date' },
      { user: { login: 'alice' }, body: 'A', created_at: '2024-01-01T00:00:00Z' },
    ] as any[];

    const res = projectCommentsSubset(raw);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    // invalid date sorts first (ts=0), then earliest valid date
    expect(res.value).toStrictEqual([
      { author: 'eve', body_markdown: 'X' },
      { author: 'alice', body_markdown: 'A' },
      { author: 'bob', body_markdown: 'B' },
    ]);
  });

  test('invalid when raw is not an array', () => {
    const res = projectCommentsSubset({} as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('invalid_comments.array');
  });

  test('invalid when item is not an object', () => {
    const res = projectCommentsSubset([123] as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('invalid_comments.item');
  });

  test('invalid when body is not string', () => {
    const res = projectCommentsSubset([
      { user: { login: 'a' }, created_at: '2024-01-01', body: 1 },
    ] as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('invalid_comments.body');
  });

  test('invalid when created_at is not string', () => {
    const res = projectCommentsSubset([
      { user: { login: 'a' }, created_at: 1, body: 'x' },
    ] as any);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe('invalid_comments.created_at');
  });

  test('invalid when user.login missing or non-string', () => {
    const res1 = projectCommentsSubset([
      { user: {}, created_at: '2024-01-01', body: 'x' },
    ] as any);
    expect(res1.ok).toBe(false);
    if (!res1.ok) expect(res1.error).toBe('invalid_comments.author');

    const res2 = projectCommentsSubset([
      { user: { login: 1 }, created_at: '2024-01-01', body: 'x' },
    ] as any);
    expect(res2.ok).toBe(false);
    if (!res2.ok) expect(res2.error).toBe('invalid_comments.author');
  });
});
