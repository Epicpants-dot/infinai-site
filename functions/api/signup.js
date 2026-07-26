// EXP-001 email capture — POST only, reached via /api/signup. GET (and any
// other method) is not exempted in functions/_middleware.js, so it 404s
// before it ever reaches here.
//
// Storage: Cloudflare KV, binding name EXP001_SIGNUPS. This binding must be
// created (namespace + binding, Pages project settings) before this route
// is reachable in production — see the exposure review for the pre-deploy
// checklist. Locally, `wrangler pages dev` needs a --kv EXP001_SIGNUPS flag
// or a matching entry in a local dev vars file.
//
// Write-only in practice: nothing in this codebase reads the namespace back
// out over HTTP. Export for the experiment record is via
// `wrangler kv key list` / `key get`, run manually — see EXP-001 record.
//
// Email is used as the KV key, which gives free de-duplication — a second
// sign-up from the same address just overwrites the same entry rather than
// creating a duplicate.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// _headers file rules don't apply to Function-authored responses (see
// functions/_middleware.js) — set explicitly here too, kept in sync.
const SECURITY_HEADERS = {
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

function redirect(location) {
  return new Response(null, { status: 303, headers: { location, ...SECURITY_HEADERS } });
}

export async function onRequestPost(context) {
  let form;
  try {
    form = await context.request.formData();
  } catch {
    return redirect("/?signup=error");
  }

  const honeypot = (form.get("website") || "").toString().trim();
  const rawEmail = (form.get("email") || "").toString().trim();

  // Bot filled the field a real visitor never sees — accept silently
  // without writing anything, so the sender gets no signal it was caught.
  if (honeypot !== "") {
    return redirect("/?signup=success");
  }

  const email = rawEmail.toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return redirect(`/?signup=error&email=${encodeURIComponent(rawEmail)}`);
  }

  try {
    await context.env.EXP001_SIGNUPS.put(
      email,
      JSON.stringify({ submitted_at: new Date().toISOString() })
    );
  } catch (err) {
    // KV write failed (e.g. binding missing/unavailable) — surface an
    // error rather than silently claiming success, and hand the email
    // back so the visitor doesn't have to retype it.
    return redirect(`/?signup=error&email=${encodeURIComponent(rawEmail)}`);
  }

  return redirect("/?signup=success");
}

// Any non-POST hitting this file directly (shouldn't happen — the
// middleware only exempts POST for this path) falls back to a plain 404
// rather than leaking a 405/allow-header fingerprint.
export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return new Response("Not found.", { status: 404, headers: SECURITY_HEADERS });
}
