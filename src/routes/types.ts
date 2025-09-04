export type RouterHandler = (req: Request) => Promise<Response> | Response;

export type RouterLike = {
  get: (path: string, handler: RouterHandler) => unknown;
};
