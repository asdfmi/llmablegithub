import { hasStringProp, isNumber, isObject, isString } from "../../shared/guards";
import type { Result } from "../../shared/result";
import type { CommentItemSubset, IssueSubset } from "./types";

export function projectIssueSubset(raw: unknown): Result<IssueSubset, string> {
  if (!isObject(raw)) return { ok: false, error: "invalid_issue.object" };
  const obj = raw as Record<string, unknown>;

  if (!isNumber(obj["number"])) return { ok: false, error: "invalid_issue.number" };
  if (!isString(obj["title"])) return { ok: false, error: "invalid_issue.title" };
  if (!isString(obj["state"])) return { ok: false, error: "invalid_issue.state" };
  if (!isString(obj["body"])) return { ok: false, error: "invalid_issue.body" };
  if (!isNumber(obj["comments"])) return { ok: false, error: "invalid_issue.comments" };
  if (!isString(obj["html_url"])) return { ok: false, error: "invalid_issue.html_url" };
  if (!isString(obj["created_at"])) return { ok: false, error: "invalid_issue.created_at" };
  if (!hasStringProp(obj["user"], "login")) return { ok: false, error: "invalid_issue.author" };

  const labelsRaw = (obj as { labels?: unknown }).labels;
  if (!Array.isArray(labelsRaw)) return { ok: false, error: "invalid_issue.labels" };
  const labels: string[] = [];
  for (const l of labelsRaw as unknown[]) {
    if (isString(l)) labels.push(l);
    else if (hasStringProp(l, "name")) labels.push((l as { name: string }).name);
    else return { ok: false, error: "invalid_issue.labels_item" };
  }

  const assigneesRaw = (obj as { assignees?: unknown }).assignees;
  if (!Array.isArray(assigneesRaw)) return { ok: false, error: "invalid_issue.assignees" };
  const assignees: string[] = [];
  for (const a of assigneesRaw as unknown[]) {
    if (!hasStringProp(a, "login")) return { ok: false, error: "invalid_issue.assignees_item" };
    assignees.push((a as { login: string }).login);
  }

  const issue: IssueSubset = {
    number: obj["number"] as number,
    title: obj["title"] as string,
    state: obj["state"] as string,
    author: ((obj["user"] as unknown) as { login: string }).login,
    labels,
    assignees,
    created_at: obj["created_at"] as string,
    body_markdown: obj["body"] as string,
    html_url: obj["html_url"] as string,
    comments_total_count: obj["comments"] as number,
  };
  return { ok: true, value: issue };
}

const toMillis = (s: string): number => {
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
};

export function projectCommentsSubset(raw: unknown[]): Result<CommentItemSubset[], string> {
  if (!Array.isArray(raw)) return { ok: false, error: "invalid_comments.array" };

  type Tmp = { ts: number; author: string; body_markdown: string };
  const tmp: Tmp[] = [];
  for (const c of raw as unknown[]) {
    if (!isObject(c)) return { ok: false, error: "invalid_comments.item" };
    const obj = c as Record<string, unknown>;
    if (!isString(obj["body"])) return { ok: false, error: "invalid_comments.body" };
    if (!isString(obj["created_at"]))
      return { ok: false, error: "invalid_comments.created_at" };
    if (!hasStringProp(obj["user"], "login"))
      return { ok: false, error: "invalid_comments.author" };
    tmp.push({
      ts: toMillis(obj["created_at"] as string),
      author: ((obj["user"] as unknown) as { login: string }).login,
      body_markdown: obj["body"] as string,
    });
  }
  const items: CommentItemSubset[] = tmp
    .sort((a, b) => a.ts - b.ts)
    .map(({ author, body_markdown }) => ({ author, body_markdown }));
  return { ok: true, value: items };
}
