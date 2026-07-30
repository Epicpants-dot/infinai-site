import { MAINTENANCE_HTML } from "./maintenance-page.js";
import { renderLandingPage } from "./exp001-landing-page.js";

// Site mode switch — three states, self-documenting reversal path. Change
// SITE_MODE and redeploy; nothing else in this file needs touching to move
// between them.
//
//   "exp001-landing" (current) — EXP-001 demand-test landing page (hub:
//     docs/experiments/EXP-001-trades-demand-test.md). Root serves the
//     landing page; /assets/buddy-promo.mp4 and
//     /assets/Infin_AI_UK_Purple_noBG2.png serve as static files (video +
//     transparent logo used by the page, added 30 July 2026 — the old
//     /assets/Infin_AI_Purple.png stays allow-listed below but is no
//     longer referenced by the template); POST /api/signup writes an
//     email to KV (functions/api/signup.js).
//     Everything else 404s — no chat widget, no agent, no proxy to Vercel.
//     Roll back to this by re-setting SITE_MODE = "exp001-landing" and
//     redeploying; the landing page and signup function are untouched code,
//     not deleted, when another mode is active.
//
//   "maintenance" — the 18 July 2026 Website Agent shutdown holding page
//     (DR-001). Blanket 503 for every request, no proxy. This is the
//     pre-EXP-001 state; revert to it if EXP-001 needs to be pulled without
//     yet deciding what replaces it.
//
//   "live-site" — original marketing site (index.html, buddy.html,
//     privacy.html — untouched in git throughout). Proxy to the Vercel
//     Website Agent app is restored for /embed*, /api/chat/message, /api/
//     admin, /_next, /admin, so the site behaves exactly as it did before
//     18 July. Note this does NOT by itself revive the agent — that gate is
//     widgetKeyMap in website-agent's lib/tenants/resolve-tenant.ts, which
//     stays empty until a separate, explicit decision reopens it. Use this
//     mode once agents are eventually revived, or to restore the original
//     site for any other reason.
const SITE_MODE = "exp001-landing";

const VERCEL_ORIGIN = "https://website-agent-pi.vercel.app";
const PROXY_PATHS = ["/embed.js", "/embed.css", "/infinai-logo.png"];
const PROXY_PREFIXES = ["/embed", "/api/chat/message", "/api/admin", "/_next", "/admin"];

// Paths exempt from the EXP-001 "everything else 404s" rule — only what the
// landing page itself needs to render and submit.
const EXP001_STATIC_PATHS = [
  "/assets/buddy-promo.mp4",
  "/assets/Infin_AI_Purple.png",
  "/assets/Infin_AI_UK_Purple_noBG2.png",
];

// _headers file rules only apply to responses served by Cloudflare Pages'
// own static-asset layer — NOT to Response objects a Function builds and
// returns directly (confirmed live, 26 July 2026: the landing page and the
// 404 response were shipping with zero security headers despite _headers
// declaring a CSP). Applied here explicitly so Function-authored responses
// get the same protection as static assets. Keep in sync with _headers.
const EXP001_SECURITY_HEADERS = {
  "content-security-policy":
    "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; script-src 'self' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com; form-action 'self'; frame-src 'none'; frame-ancestors 'none'",
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

function proxyToVercel(context) {
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

function notFound() {
  return new Response("Not found.", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex",
      ...EXP001_SECURITY_HEADERS,
    },
  });
}

export async function onRequest(context) {
  if (SITE_MODE === "maintenance") {
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
  const method = context.request.method;

  if (SITE_MODE === "live-site") {
    const shouldProxy =
      PROXY_PATHS.includes(path) ||
      PROXY_PREFIXES.some(
        (p) => path === p || path.startsWith(p + "/") || path.startsWith(p + "?")
      );
    if (shouldProxy) return proxyToVercel(context);
    return context.next();
  }

  // SITE_MODE === "exp001-landing"
  if (path === "/" && (method === "GET" || method === "HEAD")) {
    const signupState = url.searchParams.get("signup");
    const prefillEmail = url.searchParams.get("email") || undefined;
    const html = renderLandingPage({
      formState: signupState === "success" || signupState === "error" ? signupState : undefined,
      prefillEmail: signupState === "error" ? prefillEmail : undefined,
    });
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        ...EXP001_SECURITY_HEADERS,
      },
    });
  }

  if (EXP001_STATIC_PATHS.includes(path) && (method === "GET" || method === "HEAD")) {
    return context.next();
  }

  if (path === "/api/signup" && method === "POST") {
    return context.next();
  }

  return notFound();
}
