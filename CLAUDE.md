# CLAUDE.md — getampdigital.com

Static marketing site for AMP Digital. Plain HTML/CSS/JS, no build, no dependencies.
Hosted on Netlify, auto-deployed from `main`. **Pushing to `main` = publishing to production.**

## Layout
- `index.html` — single-page home. Sections by id: `#top` (hero), `#services`, `#work`, `#process`, `#about` (manifesto), `#team`, `#contact`.
- `case-studies/*.html` — one page per client (outset-medical, setpoint-medical, pklyn, phagenesis, public-citizen). Standalone pages with their own nav/footer; asset paths are `../assets/...`.
- `404.html` — custom not-found page (Netlify picks it up automatically).
- `assets/css/style.css` — all styles. Design tokens in `:root` (brand gradient `--grad-a #ff5c2b → --grad-b #ff1470`, dark theme, Inter).
- `assets/js/main.js` — nav, scroll reveal, marquee, hover effects. `assets/js/amp-invaders.js` is the 404 easter-egg game.
- `assets/img/` — `team/` headshots, `work/` client logos + tiles, `case-studies/` heroes + `gallery/`. `assets/video/` — mp4 clips with matching `.jpg` posters.
- `sitemap.xml`, `robots.txt` — update sitemap when adding a page.
- `netlify.toml` — publish dir is repo root; long cache on `/assets/*`. Don't edit without asking Bret.
- `docs/` — `site-map.md` (pages, case-study template, image/video conventions), `brand-reference.md` (colors, fonts, logos), `backlog.md` (known issues), `change-request-template.md` (how Zach/Pedro request edits), `ops.md` (Netlify notifications, monthly hygiene), `project-instructions.md` (Claude Project settings text).
- `CHANGELOG.md` — one line per push, newest first.
- `scripts/precheck.ps1` / `precheck.sh` — pre-push checks (HTML structure, asset paths, sitemap, form markup, viewport, changelog).

## Conventions
- Contact form uses Netlify Forms: `<form name="contact" data-netlify="true" netlify-honeypot="bot-field">`. Don't rename the form or remove those attributes.
- Nav and footer markup is duplicated in every HTML file. A nav/footer change must be applied to `index.html`, all five case studies, and `404.html`.
- New case study: copy an existing `case-studies/*.html`, update `<title>`, meta description, `og:url`, hero/gallery paths; add a tile in `index.html#work` and a `<url>` in `sitemap.xml`.
- Images: JPG for photos (<1 MB), PNG for logos, SVG for icons. Kebab-case filenames.
- Keep the site dependency-free. No bundler, framework, or npm build.

## Workflow
1. `git pull` first.
2. Edit. Follow `docs/site-map.md` conventions.
3. Run `scripts\precheck.ps1` (Windows) or `bash scripts/precheck.sh` (Mac). Fix every FAIL.
4. Add one line to `CHANGELOG.md`.
5. Show a plain-language diff summary and get an explicit yes before `git push`. Netlify publishes in ~10 s.
6. After push: confirm the deploy is green at https://app.netlify.com/projects/getamp/deploys and load the changed live URL to verify.
7. For big visual/structural changes, push a branch and open a PR to get a Netlify Deploy Preview URL before merging.

## Hard rules
- Never touch the form attributes or honeypot. Never edit `netlify.toml`/headers without asking.
- Sitemap updated when a page is added/removed. Nav/footer changes go to all seven HTML files.
- Mobile check at ~390px for any layout change (see `docs/backlog.md` for the current mobile issues).
