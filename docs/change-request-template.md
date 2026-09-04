# Change request — getampdigital.com

Use this for any site edit you want made (Zach, Pedro, anyone). Paste it into the AMP website Claude Project, a ClickUp task, or Slack. One request per change; a page redesign is several requests.

```
PAGE
  URL or file: e.g. https://getampdigital.com/case-studies/pklyn.html  (or index.html#team)
  Section:     e.g. gallery, third row / team card for Natalie / Solution paragraph 2

CHANGE
  Current:     what's there now (quote the text, or describe the element)
  Wanted:      exact new text, or the new behavior, or "remove"
  Why:         one line (client asked / typo / new asset / broken on mobile)

ASSETS ATTACHED
  - filename.jpg  (what it is, where it goes)      — or "none"
  Images: JPG for photos (<1 MB), PNG for logos, exact size per docs/site-map.md
  Video: MP4 (H.264, no audio needed, <5 MB) + a JPG poster frame

DEADLINE
  Date / time + timezone. "Whenever" is fine — say so.

CHECK ON
  Desktop / mobile / both. Any specific device or browser it must be right on.
```

## Rules of thumb

- Give exact copy. "Make it punchier" means a round-trip; the final sentence does not.
- Name files the way the site does: kebab-case, `client-slug-description.jpg`. See `docs/site-map.md` for sizes.
- Anything touching the contact form, `netlify.toml`, nav/footer on all pages, or adding/removing a page goes through Bret.
- Everything ships via a push to `main` after a diff review; you'll get the live URL back to confirm.

## Example

```
PAGE
  URL or file: index.html#team
  Section:     Pedro's team card
CHANGE
  Current:     Website Developer / a.k.a. cat dad ×8
  Wanted:      Website Developer / a.k.a. cat dad ×9
  Why:         new cat
ASSETS ATTACHED
  none
DEADLINE
  Whenever
CHECK ON
  Both
```
