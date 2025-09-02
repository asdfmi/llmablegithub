import { expect, test } from "vitest"

import type { CommentItemSubset, IssueSubset } from '../src/external/github/types';
import { toLLMIssueResponse } from '../src/services/github/presenter';

const baseIssue: IssueSubset = {
  number: 123,
  title: 'Add feature X',
  state: 'open',
  author: 'alice',
  labels: ['enhancement', 'good-first-issue'],
  assignees: ['bob', 'carol'],
  created_at: '2024-08-01T12:34:56Z',
  body_markdown: 'Please add feature X',
  html_url: 'https://github.com/owner/repo/issues/123',
  comments_total_count: 5,
};

const comments: CommentItemSubset[] = [
  { author: 'dave', body_markdown: 'sounds good' },
  { author: 'erin', body_markdown: '+1' },
];

test('presenter maps fields and uses comments_total_count when present', () => {
  const out = toLLMIssueResponse({
    owner: 'owner',
    repo: 'repo',
    issueNumber: 123,
    issue: baseIssue,
    comments,
  });

  expect(out.source.owner).toBe('owner');
  expect(out.source.repo).toBe('repo');
  expect(out.source.issue_number).toBe(123);
  expect(out.source.html_url).toBe(baseIssue.html_url);

  expect(out.issue.number).toBe(baseIssue.number);
  expect(out.issue.title).toBe(baseIssue.title);
  expect(out.issue.state).toBe(baseIssue.state);
  expect(out.issue.author).toBe(baseIssue.author);
  expect(out.issue.labels).toStrictEqual(baseIssue.labels);
  expect(out.issue.assignees).toStrictEqual(baseIssue.assignees);
  expect(out.issue.created_at).toBe(baseIssue.created_at);

  expect(out.content.body_markdown).toBe(baseIssue.body_markdown);

  // comments_total_count should be preferred over items.length
  expect(out.comments.total_count).toBe(5);
  expect(out.comments.items.length).toBe(2);
  expect(out.comments.items).toStrictEqual(comments);
});

test('presenter falls back to items.length when comments_total_count is undefined', () => {
  // omit comments_total_count at runtime to simulate missing upstream count
  const issueWithoutCount = { ...baseIssue };
  delete (issueWithoutCount as any).comments_total_count;

  const out = toLLMIssueResponse({
    owner: 'owner',
    repo: 'repo',
    issueNumber: 123,
    issue: issueWithoutCount as IssueSubset,
    comments,
  });

  expect(out.comments.total_count).toBe(comments.length);
});
