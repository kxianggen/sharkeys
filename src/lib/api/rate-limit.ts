// Client-side handling for HTTP 429 from the AI routes. Checked before the body
// is parsed: a 429 from the host or a rate-limit layer may not be JSON.
export const RATE_LIMIT_MESSAGE =
  "You're sending messages quickly — please wait a few minutes and try again.";

export function isRateLimited(response: Response) {
  return response.status === 429;
}
