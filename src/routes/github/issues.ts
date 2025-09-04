import type { ServiceError } from "../../services/errors";
import { getLLMableIssueResponse } from "../../services/github/service";
import type { Result } from "../../shared/result";
import { toJsonErrorResponse } from "../errors";
import type { RouterLike } from "../types";

export type ServiceFn<T> = (
  owner: string,
  repo: string,
  issueNumber: number
) => Promise<Result<T, ServiceError>>;

export function registerGithubIssueRoutes<T>(
  router: RouterLike,
  service: ServiceFn<T> = getLLMableIssueResponse as unknown as ServiceFn<T>
) {
  type RouteRequest = Request & { params?: { owner: string; repo: string; number: string } };

  router.get("/:owner/:repo/issues/:number", async (req: RouteRequest) => {
    const owner = req.params?.owner;
    const repo = req.params?.repo;
    const issueNumber = Number(req.params?.number);
    if (!owner || !repo || !Number.isInteger(issueNumber)) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    const svc = await service(owner, repo, issueNumber);
    if (!svc.ok) return toJsonErrorResponse(svc.error);
    return Response.json(svc.value);
  });
}
