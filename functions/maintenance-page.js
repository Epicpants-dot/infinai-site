// Self-contained maintenance page — inline CSS, inline SVG, no external
// requests (no fonts, no scripts, no analytics, no tracking). Returned
// directly by functions/_middleware.js for every request while
// MAINTENANCE_MODE is on.

export const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>InfinAI — Down for maintenance</title>
<meta name="robots" content="noindex" />
<style>
  :root {
    --navy: #21417A;
    --blue: #1375C3;
    --electric: #49B4F6;
    --purple: #6F30D6;
    --bg: #FDFDFD;
    --ink-soft: #4a5f8c;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100%;
    background: var(--bg);
    color: var(--navy);
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background:
      radial-gradient(circle at top right, rgba(73,180,246,0.16), transparent 30%),
      radial-gradient(circle at left top, rgba(111,48,214,0.10), transparent 26%),
      var(--bg);
  }
  .card {
    max-width: 440px;
    width: 100%;
    text-align: center;
    background: #ffffff;
    border: 1px solid rgba(33, 65, 122, 0.10);
    border-radius: 24px;
    padding: 48px 32px;
    box-shadow: 0 24px 80px rgba(33, 65, 122, 0.10);
  }
  .icon { margin: 0 auto 24px; width: 96px; height: 96px; }
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 12px;
    letter-spacing: -0.01em;
  }
  p {
    margin: 0;
    color: var(--ink-soft);
    line-height: 1.6;
    font-size: 1rem;
  }
</style>
</head>
<body>
  <div class="card">
    <svg class="icon" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="48" cy="48" r="46" fill="#FDFDFD" stroke="rgba(33,65,122,0.10)" stroke-width="2"/>
      <g transform="translate(20,22)">
        <rect x="0" y="34" width="56" height="8" rx="2" fill="#21417A" transform="rotate(-8 28 38)"/>
        <path d="M28 0 L48 34 L8 34 Z" fill="#6F30D6" stroke="#21417A" stroke-width="2" stroke-linejoin="round"/>
        <rect x="15" y="14" width="26" height="6" fill="#FDFDFD" transform="skewX(-20)"/>
        <rect x="10" y="24" width="36" height="6" fill="#FDFDFD" transform="skewX(-20)"/>
        <circle cx="28" cy="34" r="4" fill="#49B4F6"/>
      </g>
    </svg>
    <h1>Page is down for maintenance but we'll be back soon!</h1>
    <p>Thanks for your patience.</p>
  </div>
</body>
</html>`;
