import { Router } from "itty-router";

import { toJsonErrorResponse } from "./errors";
import { registerGithubIssueRoutes, type ServiceFn } from "./github/issues";
import { registerHealthRoute } from "./health";

export function buildRouter<T>(service?: ServiceFn<T>) {
  const router = Router();

  registerHealthRoute(router);

  if (service) registerGithubIssueRoutes(router, service);
  else registerGithubIssueRoutes(router);

  router.all("*", () => toJsonErrorResponse("not_found"));

  return router;
}
