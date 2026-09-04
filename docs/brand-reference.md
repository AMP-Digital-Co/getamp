# Brand reference — AMP Digital (as implemented on getampdigital.com)

Pulled from `assets/css/style.css` and `assets/img/`. This is what the site *uses*; it is not an official brand guide. Items we could not confirm are flagged ⚠️.

## Colors

Design tokens (`:root` in `style.css`):

| Token | Value | Role |
|---|---|---|
| `--grad-a` | `#ff5c2b` | Brand orange — gradient start |
| `--grad-b` | `#ff1470` | Brand pink/red — gradient end |
| `--grad` | `linear-gradient(100deg, #ff5c2b, #ff1470)` | Primary brand gradient (buttons, `.grad-text`, scrollbar, logo mark) |
| `--bg` | `#0a0a0f` | Page background (dark) |
| `--bg-soft` | `#0e0e15` | Soft section background |
| `--bg-2` | `#101018` | Card / alt background |
| `--bg-3` | `#16161f` | Raised surface |
| `--text` | `#f5f4f6` | Body text on dark |
| `--muted` | `rgba(245,244,246,0.55)` | Secondary text |
| `--faint` | `rgba(245,244,246,0.3)` | Tertiary text |
| `--line` | `rgba(255,255,255,0.08)` | Hairlines on dark |
| `--paper` | `#f5f4f6` | Light surface (bio modal) |
| `--ink` | `#101018` | Text on light surfaces |
| `--ink-muted` / `--ink-faint` / `--ink-line` | `rgba(16,16,24, .6 / .3 / .08)` | Light-surface text and lines |

Other hexes in the CSS, each used once: `#ff3a52` (scrollbar fallback, midpoint of the gradient), `#8b2bff`, `#2b8bff`, `#2bffb0`, `#ffd12b`, `#ffb02b` (⚠️ accent tints — appear to be service-card / easter-egg accents, not core brand; confirm before using elsewhere), and near-black tints `#140a06 #1c0f0a #150a1c #0c0714 #1c0a12 #14060b` (hover glows).

⚠️ Not determinable from the repo: official Pantone/CMYK values, whether `#ff5c2b`/`#ff1470` are the canonical brand hexes or web approximations, any light-mode palette.

## Typography

- Family: **Inter** via Google Fonts, weights 400 / 500 / 600 / 700 / 800 / 900. Fallback stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Base: 17px / 1.6 line-height, antialiased, on dark.
- Headlines are heavy (800–900), tight, often ALL-CAPS letter-by-letter animated (`.ltr` spans) with one gradient word (`.grad-text`). Eyebrow labels are small caps-style (`.eyebrow`).
- ⚠️ No secondary/display typeface in code. If the brand guide specifies one, it isn't on the site.

## Shape and motion

- Radii: `--radius: 20px`, `--radius-sm: 12px`.
- Easing: `--ease: cubic-bezier(0.22,1,0.36,1)`; `--spring: cubic-bezier(0.34,1.56,0.64,1)`.
- Grain overlay on every page (`.grain`), custom triangle SVG cursor (`assets/img/cursor.svg`, `cursor-press.svg`), cross-document view transitions. All motion respects `prefers-reduced-motion`.

## Logo files

| File | Size | Use |
|---|---|---|
| `assets/img/amp-logo.png` | 1116×386 | Nav and footer wordmark |
| `assets/img/amp-icon.png` | 128×128 | Favicon |
| `assets/img/amp-pattern-lg.svg` | vector, 524 KB | Background pattern |
| `assets/img/og-image-v2.jpg` | 1200×630 | Social share image |
| Triangle mark | inline SVG in footer (`#egg-g` gradient) and `.mobile-menu__mark` (▲) | Brand glyph |

⚠️ No vector (SVG/AI/EPS) master of the wordmark in the repo, no light-background or monochrome logo variant, no clear-space/minimum-size rules. Source files presumably live in Drive — link them here when found.

## Tone (inferred from site copy)

- Tagline: **"Your Mission, Amplified."** Positioning: "Boutique, full-service digital agency — since 2016" for start-ups and mission-driven enterprises.
- Confident, short, punchy headlines with a single emphasized word ("Work that *clicks.*", "Small team. *Big signal.*"). Plain-English body copy, first person plural.
- Playful edges: joke job titles (`.role-alt` "a.k.a. …"), pets as "Chief Morale Officers", hidden game in the footer. Warm and human, never corporate.
- CTAs are casual imperatives: "Say Hello", "Send it →", "Let's Amplify".
- ⚠️ No written voice/tone guide exists in the repo; the above is a reading of the copy.
