import { GITHUB_API_BASE, githubHeaders } from "../../config";
import { hasNumberProp } from "../../shared/guards";
import type { Result } from "../../shared/result";
import type { UpstreamError } from "../errors";
import { mapHttpStatusToUpstreamError } from "../errors";
import { fetchJson } from "../http";


export async function fetchIssue(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<Result<unknown, UpstreamError>> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`;
  const r = await fetchJson(
    url,
    { headers: githubHeaders() },
    (v) => hasNumberProp(v, "number"),
  );
  return r.ok ? r : { ok: false, error: mapHttpStatusToUpstreamError(r.error) };
}

// TODO: pagination
export async function fetchIssueComments(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<Result<unknown, UpstreamError>> {
  const url =
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}` +
    `/comments?per_page=100`;
  const r = await fetchJson(url, { headers: githubHeaders() }, Array.isArray);
  return r.ok ? r : { ok: false, error: mapHttpStatusToUpstreamError(r.error) };
}
