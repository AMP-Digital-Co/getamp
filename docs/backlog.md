# Backlog — getampdigital.com

Known issues and improvements. One line each; move to `CHANGELOG.md` when shipped. Newest at the top of each section.

## Open

| # | Item | Page / file | Notes |
|---|---|---|---|
| 1 | Team-bio popup on mobile | `index.html#team`, `.bio-modal` in `style.css` / `main.js` | Commit `b5db206` (2026-09-04) added `hidden` to the modal and a 500 ms re-hide timer so it can't linger over the page on phones. Needs on-device verification (iOS Safari + Android Chrome): open, close, prev/next, tap outside, scroll-lock. Confirm that hiding the modal is the intended mobile behavior vs. a tap-to-expand bio. |
| 2 | 16:9 video crop | `case-studies/*.html`, `.cs-asset--full.cs-asset--video` | Same commit forces full-width videos to 16:9 on ≤700px (other `--full` assets go 4:3). Verify no letterboxing/cropping on: SetPoint Vimeo embeds, Outset YouTube, Public Citizen half-width YouTube (`--half` is 16:9 when video). Square posters (1080×1080) in `--sq` containers and 960×1200 posters in `--port` were not touched — check they still match. |
| 3 | PKLYN case-study mobile check | `case-studies/pklyn.html` | Full pass at ~390px: hero title wrap, chip row, gallery order once collapsed to one column, `cs-credit` caption, two `cs-ambient` videos (`pklyn-reveal`, `pklyn-spin`) autoplay, prev/next block. |
| 4 | Hero image weight | `assets/img/case-studies/*-hero.jpg` | Four heroes are 750–990 KB at 2560×1440. Consider re-encoding (quality ~78) or WebP with JPG fallback. |
| 5 | Vector logo master missing | `assets/img/` | Only PNG wordmark in repo. Add SVG wordmark + light-bg variant (see `docs/brand-reference.md`). |

## Ideas / later

- Deploy notifications to Slack (steps in `docs/ops.md`).
- Automated HTML validation in CI (GitHub Action running `scripts/precheck.sh`) so Zach/Pedro pushes get checked too.
- `netlify.toml` security headers (CSP, X-Frame-Options) — needs Bret's sign-off, touches the hard-rule file.

## Done

- 2026-09-04 — Mobile: hard-hide team bio modal, keep full-width videos 16:9 (`b5db206`).
