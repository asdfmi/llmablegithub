import { Router } from "itty-router";

import { toJsonErrorResponse } from "./errors";
import { registerGithubIssueRoutes, type ServiceFn } from "./github/issues";

export function buildRouter<T>(service?: ServiceFn<T>) {
  const router = Router();

  if (service) registerGithubIssueRoutes(router, service);
  else registerGithubIssueRoutes(router);

  router.all("*", () => toJsonErrorResponse("not_found"));

  return router;
}
