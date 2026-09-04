# Site map — getampdigital.com

Static site, no build. Every page carries its own copy of the nav, mobile menu, and footer.

## Pages

| URL | File | Notes |
|---|---|---|
| `/` | `index.html` | Single-page home. Sections in order: `#top` hero → marquee → `#services` → `#work` → `#process` → `#about` (manifesto) → `#team` → `#contact` → bio modal → footer → 3D logo toy. |
| `/case-studies/setpoint-medical.html` | `case-studies/setpoint-medical.html` | Work tile 01 |
| `/case-studies/outset-medical.html` | `case-studies/outset-medical.html` | Work tile 02 |
| `/case-studies/pklyn.html` | `case-studies/pklyn.html` | |
| `/case-studies/phagenesis.html` | `case-studies/phagenesis.html` | |
| `/case-studies/public-citizen.html` | `case-studies/public-citizen.html` | |
| `/404.html` | `404.html` | Netlify serves it automatically. Contains the AMP Invaders easter egg (`assets/js/amp-invaders.js`). Not in sitemap. |
| `/sitemap.xml`, `/robots.txt` | root | Sitemap lists the six public pages. Update on add/remove. |

Shared assets: `assets/css/style.css` (all styles, tokens in `:root`), `assets/js/main.js` (nav, reveal, marquee, bio modal, pets card, hover effects).

## Case-study template

Copy the closest existing `case-studies/*.html`. Structure, top to bottom:

1. `<head>` — `<title>{Client} — AMP Digital</title>`, `meta description`, `og:title/description/url` (absolute URL of this page), `og:image`, favicon, Inter from Google Fonts, `../assets/css/style.css`.
2. NAV + mobile menu — links point to `../index.html#section`. Identical across all case studies.
3. `section.cs-hero` — `.cs-hero__glow`, `.cs-hero__client.grad-text` (client name), `h1.cs-hero__title`, `.cs-hero__meta` of `span.cs-chip` tags (first one has `cs-chip--year`).
4. `div.wrap > div.cs-block.reveal` × 2 — **Challenge** and **Solution**. Each: `.cs-block__label > span.grad-text` + `.cs-block__body` paragraphs.
5. `div.cs-gallery.reveal-stagger` — visual assets. Each item is `div.cs-asset` with a size modifier and a type modifier:
   - Size: `cs-asset--full` (spans grid, 16:9; add `cs-asset--43` for 4:3), `cs-asset--half` (4:3; 16:9 when video), `cs-asset--port` (4:5), `cs-asset--sq` (1:1).
   - Type: `cs-asset--img` (add `data-spot` for the hover spotlight) or `cs-asset--video`. Add `cs-asset--contain` to letterbox instead of crop.
   - Optional `div.cs-credit` caption under an asset.
   - On ≤700px the grid collapses to one column and `cs-asset--full` becomes 4:3, except videos stay 16:9.
6. PREV / NEXT — `.cs-nav` with "Next Project →" linking to the next case study and a back link to `../index.html#work`. Keep the chain in tile order.
7. FOOTER — identical across pages, links to `../index.html#…`.

Adding a case study also requires: a `work-card` tile in `index.html#work` (`assets/img/work/<slug>-color.jpg` 1800×1200 + `<slug>-logo.png` ~1000px wide PNG), a `<url>` in `sitemap.xml`, updating the prev/next chain, and a `CHANGELOG.md` line.

## Team bios and headshots

- Markup: `index.html` → `#team` → `div.team-grid` → one `div.team-card` per person. Bio text lives in the card's `data-bio` attribute (HTML-escaped: `&amp;`, `&mdash;`). Name in `.team-card__name`, title in `.role-main`, joke title in `.role-alt`.
- Headshots: `assets/img/team/<firstname>.jpg`, 800×800 JPG, square. Current: alex, zach, bret, shannon, matt, natalie, pedro.
- Pets card: `team-card--pets` cycles `assets/img/team/pet-1.jpg` … `pet-5.jpg` (800×800). Add a pet by adding an `<img class="pet-shot">` in the card; JS picks them up.
- Bio modal (`.bio-modal`, populated by `main.js` from `data-bio`) crops headshots with per-person `object-position` rules in `style.css` (`.bio-modal__media img[src*="name"]`). New headshot → add a rule if the face is off-center.

## Image conventions

| Use | Path | Size | Format |
|---|---|---|---|
| Case-study hero | `assets/img/case-studies/<slug>-hero.jpg` | 2560×1440 | JPG |
| Gallery portrait | `assets/img/case-studies/gallery/<slug>-<desc>.jpg` | 1200×1500 (4:5); 1280×1600 also in use | JPG |
| Gallery landscape | same folder | 1920×1080-ish (16:9) | JPG |
| Work tile photo | `assets/img/work/<slug>-color.jpg` | 1800×1200 (setpoint is 2520×1080 for the wide tile) | JPG |
| Work tile logo | `assets/img/work/<slug>-logo.png` | ~1000×220–250, transparent | PNG |
| Team headshot | `assets/img/team/<name>.jpg` | 800×800 | JPG |
| OG image | `assets/img/og-image-v2.jpg` | 1200×630 | JPG |
| Logo / icon | `assets/img/amp-logo.png` (1116×386), `amp-icon.png` (128×128) | | PNG |

Keep photos under ~1 MB (several heroes are 750–990 KB — near the limit). Kebab-case filenames. Public Citizen assets use the `pc-` prefix.

## Video conventions

- Self-hosted clips: `assets/video/<slug>-<desc>.mp4` with a same-name `.jpg` poster. Markup: `<video class="cs-ambient" muted loop playsinline preload="metadata" poster="../assets/video/x.jpg" aria-label="…"><source src="../assets/video/x.mp4" type="video/mp4"></video>` inside a `cs-asset--video`. `main.js` plays them when in view. Poster sizes in use: 1280×720 (16:9), 1080×1080 (square, use `cs-asset--sq`), 960×1200 (4:5, use `cs-asset--port`). Match the container aspect to the clip or it crops.
- Embedded: YouTube (`https://www.youtube.com/embed/<id>`) and Vimeo (`https://player.vimeo.com/video/<id>?h=…&title=0&byline=0&portrait=0&badge=0`) `<iframe loading="lazy" title="…" allow="…">` inside `cs-asset--full` or `cs-asset--half` + `cs-asset--video`. The container controls the aspect ratio; iframe fills it.
- Largest clip is `setpoint-yir.mp4` (7.2 MB). Keep new clips under ~5 MB, H.264, no audio needed (they're muted).
