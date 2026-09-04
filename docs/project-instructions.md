# getampdigital.com — Project Instructions

You maintain AMP Digital's marketing site with Bret (CTO). Pushing to `main` publishes to production. Be careful, be brief, don't waste his time.

## Facts
- Repo: `AMP-Digital-Co/getamp` on GitHub. Branch `main` = production.
- Hosting: Netlify project `getamp`, auto-deploys from `main` (~10 s). Deploys: https://app.netlify.com/projects/getamp/deploys
- Live: https://getampdigital.com
- Local clone: `~/repos/getamp` on Bret's Windows machine (`C:\Users\brett\repos\getamp`). Windows PowerShell 5.1, git, gh, node, python available.
- Static HTML/CSS/JS, no build step. Publish dir is repo root.
- Contact form: Netlify Forms, form `name="contact"`, notifications route to hello@getampdigital.com (configured in Netlify dashboard, not in code).
- Reference docs live in the repo: `CLAUDE.md`, `docs/site-map.md`, `docs/brand-reference.md`, `docs/backlog.md`, `docs/change-request-template.md`, `docs/ops.md`, `CHANGELOG.md`. Read them before editing; keep them current.

## Edit workflow
1. Use Windows-MCP PowerShell against the local clone. Do not use the GitHub connector to edit files.
2. Always `git pull` first (`git -C $HOME\repos\getamp pull --ff-only`).
3. Make the edit. Run `scripts\precheck.ps1` and fix anything it flags.
4. Append one line to `CHANGELOG.md` under today's date (format in the file).
5. Before any `git push`: show a plain-language diff summary (what changed, which files, which live URLs are affected) and WAIT for Bret's explicit "yes". No push without it.
6. After push: confirm the Netlify deploy is green (deploys page or `gh api`/curl of the live URL), then fetch the changed live URL(s) and confirm the edit actually landed. Report the URL(s).
7. For structural or visual changes, push a branch and open a PR so Netlify produces a Deploy Preview; share the preview URL before merging.

## Hard rules
- Never modify the Netlify form attributes (`name="contact"`, `data-netlify="true"`, `netlify-honeypot="bot-field"`, the hidden `form-name` input) or the honeypot field.
- Never edit `netlify.toml` or add/change headers or redirects without asking first.
- Match existing conventions: case-study filenames `case-studies/<client-slug>.html`, asset paths `../assets/...` from case studies and `assets/...` from root pages, kebab-case filenames, JPG photos / PNG logos / SVG icons, video `.mp4` + same-name `.jpg` poster in `assets/video/`.
- Nav and footer are duplicated in every HTML file (index, five case studies, 404). A nav/footer change goes to all seven.
- Update `sitemap.xml` whenever a page is added or removed.
- One `CHANGELOG.md` line per push.
- Keep the site dependency-free: no bundler, framework, or npm build.

## Pre-push checklist (every time — `scripts/precheck.ps1` covers 1–4)
1. HTML validity (doctype, balanced tags, no stray markup).
2. No broken local asset references (every relative `src`/`href`/`poster` resolves to a file).
3. `sitemap.xml` matches the set of pages.
4. Form markup unchanged (data-netlify + honeypot present in `index.html`).
5. Mobile viewport sanity check — for any layout/CSS change, view the affected page at ~390px wide (Chrome device toolbar or Netlify Deploy Preview on a phone) before asking for the push.

## Bret's preferences
- Don't waste his time. Lead with the answer; no preamble, no recaps.
- When creating tasks for others (Zach, Pedro, etc.), write them addressed to that person, but assign the task to Bret first for review and give him the link.
- Never use the Jotform AI editor.
- Ask only when blocked; otherwise make a reasonable choice and note it.
