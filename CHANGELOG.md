# Changelog — getampdigital.com

One line per push to `main`, newest first. Format: `- YYYY-MM-DD — what changed (who)`. Add the line in the same commit as the change.

## 2026-10

- 2026-10-20 — Slack deploy notifications to #ampland via GitHub Action (notify-slack.yml). (Claude)
- 2026-10-20 — Fix 3D logo toy (CSP now allows three.js from cdn.jsdelivr.net); remove Pedro from team grid, grid to 3 columns; Pedro's dog removed from the Pets card. Hero JPGs re-encoded under 600 KB. SVG logo masters added. GitHub Action runs precheck on PRs. Flagged by Matt/Zach in #ampland. (Claude)
- 2026-10-14 — Security headers in netlify.toml (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy). Approved by Bret. (Claude)

## 2026-09

- 2026-09-15 — docs/ops.md: Netlify account/team notes, deploy-preview troubleshooting, consolidation steps (Claude for Bret)
- 2026-09-15 — Contact: after a successful submit the form is replaced by an animated "Message sent." panel with a "Send another" link; button shows a sending state (Zach)
- 2026-09-09 — Team: Natalie's title changed to Digital Strategist (Zach)

- 2026-09-04 — New social share image (og-image-v2.jpg) across all pages (Zach)
- 2026-09-04 — Mobile fixes: service-card front no longer bleeds through the back mid-spin on iOS; value-row hover effects limited to hover-capable devices; footer CTA gets side padding and a two-line kicker under 768px (Bret)
- 2026-09-04 — Repo reliability scaffolding: `docs/` (site map, brand reference, backlog, change-request template, ops, project instructions), `scripts/precheck.ps1` + `.sh` pre-push checks, this changelog; CLAUDE.md and README updated to point at them (Bret)
- 2026-09-04 — Mobile fix: hard-hide team bio modal when closed; keep full-width case-study videos 16:9 on small screens (Bret)
- 2026-09-04 — Team onboarding scripts (`setup.ps1`, `setup.sh`), README, CLAUDE.md, `netlify.toml` with long-cache headers for `/assets/*` (Bret)
- 2026-09-04 — Site launch: home page, five case studies (SetPoint Medical, Outset Medical, PKLYN, Phagenesis, Public Citizen), custom 404, Netlify Forms contact form, sitemap/robots (Bret)
