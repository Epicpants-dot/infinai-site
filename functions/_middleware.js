import { MAINTENANCE_HTML } from "./maintenance-page.js";

// Site-wide maintenance mode — 18 July 2026, Website Agent shutdown (DR-001).
// While true, EVERY request gets the holding page — no exceptions, including
// /privacy.html and the proxy paths below. This intentionally sits before the
// proxy logic: it also stops /embed* and /api/chat/message being forwarded to
// Vercel at all, extra defense-in-depth alongside the server-side agent
// shutdown in website-agent (chore/shutdown-agents branch).
// Relaunch: flip this back to false and redeploy. Nothing else in this repo
// was touched — index.html, buddy.html, privacy.html are untouched in git.
const MAINTENANCE_MODE = true;

const VERCEL_ORIGIN = "https://website-agent-pi.vercel.app";
const PROXY_PATHS = ["/embed.js", "/embed.css", "/infinai-logo.png"];
const PROXY_PREFIXES = ["/embed", "/api/chat/message", "/api/admin", "/_next", "/admin"];

export async function onRequest(context) {
  if (MAINTENANCE_MODE) {
    return new Response(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "retry-after": "86400",
        "cache-control": "no-store",
        "content-security-policy":
          "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'",
        "x-robots-tag": "noindex",
      },
    });
  }

  const url = new URL(context.request.url);
  const path = url.pathname;

  const shouldProxy =
    PROXY_PATHS.includes(path) ||
    PROXY_PREFIXES.some(
      (p) => path === p || path.startsWith(p + "/") || path.startsWith(p + "?")
    );

  if (!shouldProxy) return context.next();

  const target = new URL(context.request.url);
  const originalHost = target.hostname;
  target.hostname = "website-agent-pi.vercel.app";
  target.protocol = "https:";

  const proxyHeaders = new Headers(context.request.headers);
  proxyHeaders.set("x-forwarded-host", originalHost);

  return fetch(target.toString(), {
    method: context.request.method,
    headers: proxyHeaders,
    body:
      context.request.method !== "GET" && context.request.method !== "HEAD"
        ? context.request.body
        : undefined,
    redirect: "manual",
  });
}
