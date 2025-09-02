export type IssueSubset = {
  number: number;
  title: string;
  state: string;
  author: string;
  labels: string[];
  assignees: string[];
  created_at: string;
  body_markdown: string;
  html_url: string;
  comments_total_count: number;
};

export type CommentItemSubset = {
  author: string;
  body_markdown: string;
};
