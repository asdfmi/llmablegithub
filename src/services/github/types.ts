import type { CommentItemSubset } from "../../external/github/types";

export type LLMableIssue = {
  source: {
    owner: string;
    repo: string;
    issue_number: number;
    html_url: string;
  };
  issue: {
    number: number;
    title: string;
    state: string;
    author: string;
    labels: string[];
    assignees: string[];
    created_at: string;
  };
  content: {
    body_markdown: string;
  };
  comments: {
    total_count: number;
    items: CommentItemSubset[];
  };
};
