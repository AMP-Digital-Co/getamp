# Backlog — getampdigital.com

Known issues and improvements. One line each; move to `CHANGELOG.md` when shipped. Newest at the top of each section.

## Open

| # | Item | Page / file | Notes |
|---|---|---|---|
| 1 | Team-bio modal on mobile: tap-to-expand vs modal? | `index.html#team` | Modal verified working at 390px (2026-10-20): open, close, backdrop tap, prev/next, scroll-lock, hidden after close. Prev/next arrows are not visible at phone width (CSS). Bret to decide whether a modal is the wanted mobile behavior; otherwise closed. |

## Ideas / later

- Deploy notifications to Slack (steps in `docs/ops.md`). Needs the analytics@ Netlify login.
- Deploy Previews return 401 (Netlify site protection on non-production deploys). Set previews public or give Zach the password — Netlify → Access & security → Site protection. Needs the analytics@ login.

## Done

- 2026-10-20 — Verified at 390px: team-bio modal, 16:9 video containers (SetPoint/Outset/Public Citizen, incl. `--sq` 1:1 and `--port` 4:5 posters), full PKLYN pass (hero, chips, gallery order, credit, both ambient videos autoplay, prev/next). Re-encoded 4 hero JPGs to <600 KB. Added SVG logo masters. Added GitHub Action running `scripts/precheck.sh` on PRs. `netlify.toml` security headers shipped 2026-10-14.
- 2026-09-04 — Mobile: hard-hide team bio modal, keep full-width videos 16:9 (`b5db206`).
