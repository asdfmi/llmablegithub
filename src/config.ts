export const APP_NAME = "llmablegithub" as const;

export const GITHUB_API_BASE = "https://api.github.com" as const;

export const USER_AGENT = "llmable-github/0.1" as const;

export function githubHeaders(token?: string): HeadersInit {
  const base: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
  };
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}
