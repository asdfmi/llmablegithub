import assert from 'node:assert/strict';
import test from 'node:test';

// Note: import .js to make the compiled path resolve to dist/src/...
import type { CommentItemSubset, IssueSubset } from '../src/external/github/types.js';
import { toLLMIssueResponse } from '../src/services/github/presenter.js';

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

  assert.strictEqual(out.source.owner, 'owner');
  assert.strictEqual(out.source.repo, 'repo');
  assert.strictEqual(out.source.issue_number, 123);
  assert.strictEqual(out.source.html_url, baseIssue.html_url);

  assert.strictEqual(out.issue.number, baseIssue.number);
  assert.strictEqual(out.issue.title, baseIssue.title);
  assert.strictEqual(out.issue.state, baseIssue.state);
  assert.strictEqual(out.issue.author, baseIssue.author);
  assert.deepStrictEqual(out.issue.labels, baseIssue.labels);
  assert.deepStrictEqual(out.issue.assignees, baseIssue.assignees);
  assert.strictEqual(out.issue.created_at, baseIssue.created_at);

  assert.strictEqual(out.content.body_markdown, baseIssue.body_markdown);

  // comments_total_count should be preferred over items.length
  assert.strictEqual(out.comments.total_count, 5);
  assert.strictEqual(out.comments.items.length, 2);
  assert.deepStrictEqual(out.comments.items, comments);
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

  assert.strictEqual(out.comments.total_count, comments.length);
});
