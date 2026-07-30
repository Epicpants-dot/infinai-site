// EXP-001 demand-test landing page — self-contained inline CSS, minimal
// markup, no client-side JS required for the core flow (email form is a
// plain HTML POST to /api/signup, which redirects back here with a query
// param; see signup.js). The only external request is the Cloudflare Web
// Analytics beacon, allowed for by the CSP in _headers.
//
// Rendered by functions/_middleware.js for GET / only. Everything else
// 404s — see the routing comment there.
//
// Video is 9:16 only (EXP-001 record, Adjustment 1, 23 July 2026) — the
// promo was shot vertical for phone-scrolled Facebook-group distribution.
// Embedded at a constrained width so it also reads cleanly on desktop
// rather than stretching edge to edge.
//
// Visual pass, 28 July 2026 (Buddy brief — first-impression fix): logo
// added (asset already allow-listed in _middleware.js, just never
// referenced here before). No new assets, fonts, or external requests
// introduced — CSP unchanged.
//
// Copy/order pass, 28 July 2026 (Buddy brief — cold-traffic order):
// deliberately reverses the sign-up form back below the video. Cold
// trade visitors have never heard of InfinAI or a "website agent" —
// explain, prove with the video, then ask. Do not move the form back
// above the fold without a new instruction; this is intentional, not
// a regression of the first pass.
//
// Logo + reorder pass, 30 July 2026 (Buddy brief — supersedes the
// previous order): transparent logo (Infin_AI_UK_Purple_noBG2.png,
// cropped from Jason's source file to trim built-in transparent
// padding — see the commit for the crop rationale), wordmark text
// dropped, video now sandwiched between the explainer block and the
// bullets. This order is the current source of truth.

function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function renderForm(state, prefillEmail) {
  if (state === "success") {
    return `
      <div class="form-card form-card-success" role="status">
        <h2>You're on the list.</h2>
        <p>We'll email you the moment early access opens. No spam, no marketing list — just that one email.</p>
      </div>`;
  }

  const errorNote =
    state === "error"
      ? `<p class="form-error" role="alert">That didn't look like a valid email, or something went wrong our end — mind trying again?</p>`
      : "";
  const emailValue = prefillEmail ? ` value="${escapeAttr(prefillEmail)}"` : "";

  return `
    <div class="form-card">
      <form action="/api/signup" method="POST">
        <label for="email">Email address</label>
        <div class="form-row">
          <input type="email" id="email" name="email" placeholder="you@yourbusiness.co.uk"${emailValue} required />
          <button type="submit">Get early access</button>
        </div>
        <!-- Honeypot: real visitors never see or fill this in; bots that
             auto-fill every field do. Left blank => real submission. -->
        <div class="hp-field" aria-hidden="true">
          <label for="website">Leave this field blank</label>
          <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" />
        </div>
        ${errorNote}
        <p class="privacy-note">
          InfinAI-UK will only use your email to tell you when early access opens.
          Nothing else, no marketing list. Email
          <a href="mailto:hello@infinai.uk">hello@infinai.uk</a> any time to be removed.
        </p>
      </form>
    </div>`;
}

export function renderLandingPage({ formState, prefillEmail } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Buddy — a website agent that answers your out-of-hours enquiries</title>
<meta name="description" content="Buddy answers instantly, asks the right questions, and sends you a qualified lead. From £49/month. Early access for trade businesses." />
<meta name="robots" content="noindex" />
<style>
  :root {
    --navy: #21417A;
    --blue: #1375C3;
    --electric: #49B4F6;
    --purple: #6F30D6;
    --bg: #FDFDFD;
    --ink-soft: #4a5f8c;
    --line: rgba(33, 65, 122, 0.12);
    --button-gradient: linear-gradient(135deg, #1F9FEF 0%, #6F30D6 100%);
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    /* Restrained gradient (existing brand tokens, no new asset) so wide
       viewports don't read as flat dead space either side of the column —
       the "thrown together" complaint was worst here, not on mobile. */
    background:
      radial-gradient(ellipse 900px 500px at 50% 0%, rgba(111, 48, 214, 0.07), transparent 65%),
      linear-gradient(180deg, #F4F2FB 0%, var(--bg) 420px);
    color: var(--navy);
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    line-height: 1.6;
  }
  .wrap { max-width: 480px; margin: 0 auto; padding: 28px 20px 64px; }
  header { text-align: center; margin-bottom: 22px; }
  /* Logo stands alone now (wordmark text dropped) — sized bigger again
     since it's the only brand element up top and needs to carry that on
     its own. Source PNG is pre-cropped to its visible content, so this
     height maps directly to the mark rather than including dead
     transparent padding. */
  .brand-logo { height: 128px; width: auto; }
  h1 {
    text-align: center;
    font-size: 1.55rem;
    font-weight: 800;
    line-height: 1.3;
    margin: 6px 0 20px;
    letter-spacing: -0.01em;
  }
  .video-label {
    text-align: center;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--navy);
    margin: 4px 0 12px;
  }
  .video-shell {
    position: relative;
    width: 100%;
    max-width: 270px;
    margin: 0 auto 28px;
    aspect-ratio: 9 / 16;
    border-radius: 24px;
    overflow: hidden;
    background: #000;
    box-shadow: 0 24px 60px rgba(33, 65, 122, 0.18);
  }
  .video-shell video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
  .pain-promise {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 24px 22px;
    margin: 0 0 28px;
  }
  .pain-promise p { margin: 0 0 12px; color: var(--ink-soft); font-size: 0.98rem; }
  .pain-promise p:last-child { margin-bottom: 0; }
  .pain-promise strong { color: var(--navy); }
  /* Standalone card now (moved below the video) — no longer follows
     paragraphs in the same card, so no divider needed above it. */
  .how-it-works {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .how-it-works li {
    color: var(--ink-soft);
    font-size: 0.95rem;
    padding-left: 22px;
    position: relative;
    margin-bottom: 8px;
  }
  .how-it-works li:last-child { margin-bottom: 0; }
  .how-it-works li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--blue);
    font-weight: 700;
  }
  .price-anchor {
    text-align: center;
    margin: 28px 0 8px;
  }
  .price-anchor .price {
    font-size: 2rem;
    font-weight: 800;
    background: var(--button-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .price-anchor .price-note {
    display: block;
    font-size: 0.85rem;
    color: var(--ink-soft);
    margin-top: 4px;
  }
  .offer-heading {
    text-align: center;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--navy);
    margin: 0 0 8px;
  }
  .offer-body {
    text-align: center;
    color: var(--ink-soft);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 20px;
  }
  .form-card {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 24px 22px;
    box-shadow: 0 16px 48px rgba(33, 65, 122, 0.08);
  }
  .form-card h2 { margin: 0 0 8px; font-size: 1.15rem; }
  .form-card label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; }
  .form-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .form-row input[type="email"] {
    flex: 1 1 180px;
    min-width: 0;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: 12px;
    font-size: 0.95rem;
    font-family: inherit;
  }
  .form-row button {
    flex: 0 0 auto;
    padding: 12px 18px;
    border: none;
    border-radius: 12px;
    background: var(--button-gradient);
    color: #fff;
    font-weight: 700;
    font-size: 0.92rem;
    cursor: pointer;
    white-space: nowrap;
  }
  .form-error {
    color: #b3261e;
    font-size: 0.85rem;
    margin: 10px 0 0;
  }
  .privacy-note {
    font-size: 0.78rem;
    color: var(--ink-soft);
    margin: 14px 0 0;
  }
  .privacy-note a { color: var(--blue); text-decoration: underline; }
  .form-card-success h2 { color: var(--navy); }
  .form-card-success p { color: var(--ink-soft); margin: 0; }
  /* Honeypot: visually hidden but present in the DOM/tab order avoided
     via tabindex="-1" — kept off-screen rather than display:none so basic
     bots that skip display:none fields still trip it. */
  .hp-field {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
  footer {
    text-align: center;
    margin-top: 40px;
    font-size: 0.78rem;
    color: var(--ink-soft);
  }
  footer a { color: var(--blue); }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <img src="/assets/Infin_AI_UK_Purple_noBG2.png" alt="InfinAI" class="brand-logo" />
    </header>

    <h1>Missed calls become missed jobs. Buddy answers instead.</h1>

    <div class="pain-promise">
      <p>Every missed call out of hours is a job that goes to someone else. Evenings, weekends, mid-callout: the enquiries don't stop but you can't always answer.</p>
      <p>Buddy is your website agent from InfinAI. It gets to know your business, how you work, what a good job looks like and the questions worth asking, then answers your enquiries instantly, qualifies them and emails you a lead ready to call. You get back to a real enquiry, not a voicemail.</p>
    </div>

    <p class="video-label">See Buddy answer a real enquiry ↓</p>
    <div class="video-shell">
      <video controls playsinline preload="metadata" aria-label="Buddy demo — a boiler breakdown enquiry, answered and turned into a qualified lead">
        <source src="/assets/buddy-promo.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="pain-promise">
      <ul class="how-it-works">
        <li>An agent that knows your business, how you operate and what you need</li>
        <li>Answers instantly, no more voicemail</li>
        <li>Asks the right questions to qualify every enquiry</li>
        <li>Emails you a ready-to-call lead</li>
        <li>Set up for you, no faff, works with the website you already have</li>
      </ul>
    </div>

    <h2 class="offer-heading">Get early access, founding 10</h2>
    <p class="offer-body">Be one of our first 10 trade businesses and we'll waive your £190 setup fee, on the monthly plan, no contract. We'll email you the moment it opens.</p>

    ${renderForm(formState, prefillEmail)}

    <div class="price-anchor">
      <span class="price">From £49/month</span>
      <span class="price-note">Early access for our first 10 trade businesses</span>
    </div>

    <footer>
      InfinAI-UK &middot; <a href="mailto:hello@infinai.uk">hello@infinai.uk</a>
    </footer>
  </div>
  <!-- Cloudflare Web Analytics — cookieless, no consent banner required.
       Token from the infinai.uk Web Analytics site added 26 July 2026. -->
  <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "fc3cea840190469eb3d9141367a7e74e"}'></script>
</body>
</html>`;
}
