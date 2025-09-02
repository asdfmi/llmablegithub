import type { CommentItemSubset, IssueSubset } from "../../external/github/types";
import type { LLMableIssue } from "./types";

export function toLLMIssueResponse(params: {
  owner: string;
  repo: string;
  issueNumber: number;
  issue: IssueSubset;
  comments: CommentItemSubset[];
}): LLMableIssue {
  const { owner, repo, issueNumber, issue: i, comments: c } = params;
  return {
    source: {
      owner,
      repo,
      issue_number: issueNumber,
      html_url: i.html_url,
    },
    issue: {
      number: i.number,
      title: i.title,
      state: i.state,
      author: i.author,
      labels: i.labels,
      assignees: i.assignees,
      created_at: i.created_at,
    },
    content: {
      body_markdown: i.body_markdown,
    },
    comments: {
      total_count: i.comments_total_count ?? c.length,
      items: c,
    },
  };
}
