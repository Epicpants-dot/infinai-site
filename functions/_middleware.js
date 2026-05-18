const VERCEL_ORIGIN = "https://website-agent-pi.vercel.app";
const PROXY_PATHS = ["/embed.js", "/embed.css", "/infinai-logo.png"];
const PROXY_PREFIXES = ["/embed", "/api/chat/message", "/_next", "/admin"];

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  const shouldProxy =
    PROXY_PATHS.includes(path) ||
    PROXY_PREFIXES.some(
      (p) => path === p || path.startsWith(p + "/") || path.startsWith(p + "?")
    );

  if (!shouldProxy) return context.next();

  const target = new URL(context.request.url);
  target.hostname = "website-agent-pi.vercel.app";
  target.protocol = "https:";

  return fetch(target.toString(), {
    method: context.request.method,
    headers: context.request.headers,
    body:
      context.request.method !== "GET" && context.request.method !== "HEAD"
        ? context.request.body
        : undefined,
  });
}
