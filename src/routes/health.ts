import type { RouterLike } from "./types";

export function registerHealthRoute(router: RouterLike) {
  router.get("/health", () =>
    Response.json({ ok: true }),
  );
}
