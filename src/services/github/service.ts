import { projectCommentsSubset, projectIssueSubset } from "../../external/github/adapter";
import { fetchIssue, fetchIssueComments } from "../../external/github/client";
import { hasProp } from "../../shared/guards";
import type { Result } from "../../shared/result";
import { mapUpstreamToServiceError, type ServiceError } from "../errors";
import { toLLMIssueResponse } from "./presenter";
import type { LLMableIssue } from "./types";

export type ServiceResult<T> = Result<T, ServiceError>;

export type GitHubPort = {
  fetchIssue: typeof fetchIssue;
  fetchIssueComments: typeof fetchIssueComments;
};

const defaultPort: GitHubPort = { fetchIssue, fetchIssueComments };

export async function getLLMableIssueResponse(
  owner: string,
  repo: string,
  issueNumber: number,
  port: GitHubPort = defaultPort
): Promise<ServiceResult<LLMableIssue>> {
  const issueRes = await port.fetchIssue(owner, repo, issueNumber);
  if (!issueRes.ok) return { ok: false, error: mapUpstreamToServiceError(issueRes.error) };

  const issueRaw = issueRes.value;
  if (hasProp(issueRaw, "pull_request")) {
    return { ok: false, error: "resource_mismatch" };
  }

  const issueSub = projectIssueSubset(issueRaw);
  if (!issueSub.ok) return { ok: false, error: "upstream_invalid_payload" };

  const commentsRes = await port.fetchIssueComments(owner, repo, issueNumber);
  if (!commentsRes.ok && commentsRes.error !== "not_found")
    return { ok: false, error: mapUpstreamToServiceError(commentsRes.error) };
  const commentsRaw: unknown[] = commentsRes.ok ? (commentsRes.value as unknown[]) : [];

  const commentsSub = projectCommentsSubset(commentsRaw);
  if (!commentsSub.ok) return { ok: false, error: "upstream_invalid_payload" };

  const out = toLLMIssueResponse({
    owner,
    repo,
    issueNumber,
    issue: issueSub.value,
    comments: commentsSub.value,
  });
  return { ok: true, value: out };
}
