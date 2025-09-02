import { hasNumberProp } from "../../shared/guards";
import type { Result } from "../../shared/result";
import type { UpstreamError } from "../errors";
import { mapHttpStatusToUpstreamError } from "../errors";
import { fetchJson } from "../http";

const GH_API_BASE = "https://api.github.com";

const GH_HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "User-Agent": "llmable-github/0.1",
};


export async function fetchIssue(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<Result<unknown, UpstreamError>> {
  const url = `${GH_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`;
  const r = await fetchJson(url, { headers: GH_HEADERS }, (v) => hasNumberProp(v, "number"));
  return r.ok ? r : { ok: false, error: mapHttpStatusToUpstreamError(r.error) };
}

// TODO: pagination
export async function fetchIssueComments(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<Result<unknown, UpstreamError>> {
  const url = `${GH_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`;
  const r = await fetchJson(url, { headers: GH_HEADERS }, Array.isArray);
  return r.ok ? r : { ok: false, error: mapHttpStatusToUpstreamError(r.error) };
}
