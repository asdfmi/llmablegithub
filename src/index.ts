import { buildRouter } from "./routes/router";

export default {
  async fetch(request: Request): Promise<Response> {
    const router = buildRouter();
    return await router.fetch(request);
  },
};
