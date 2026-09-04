# Operations notes — getampdigital.com

## Netlify deploy notifications

Slack:
1. In Slack: create an incoming webhook for the channel you want (Slack → Apps → *Incoming WebHooks* → Add to Slack → pick channel → copy the webhook URL). Suggested channel: `#getamp-site` or wherever web notifications already land.
2. In Netlify: https://app.netlify.com/projects/getamp/configuration/notifications → **Deploy notifications** → **Add notification** → **Slack integration**.
3. Event: *Deploy succeeded*. Paste the webhook URL. Save. Repeat for *Deploy failed* (this is the one that matters).
4. Optionally add *Deploy Preview ready* so PR previews post their URL.

Email:
1. Same page → **Add notification** → **Email notification**.
2. Event: *Deploy failed* → bret@getampdigital.com. Add *Deploy succeeded* only if you want a mail per push.

Form submissions: Site configuration → **Forms** → **Form notifications** → confirm the `contact` form emails hello@getampdigital.com. Add a Slack webhook here too if wanted.

(Menu labels drift; if they don't match, search "notifications" in the Netlify project settings.)

## Claude Chrome extension pre-approval

For Claude to check deploys or verify live pages without a permission prompt each time, pre-approve these sites in the Claude Chrome extension (extension icon → site permissions / allowed sites):
- `app.netlify.com`
- `github.com`
- `getampdigital.com` (read-only verification of live pages)

Keep it read-mostly: Claude should look at deploy status and live pages, not click "Trigger deploy" or merge PRs in the browser.

## Monthly hygiene (first Monday)

- [ ] **Form test** — submit the contact form on the live site with subject "monthly test". Confirm it appears in Netlify → Forms → `contact` and the email reaches hello@getampdigital.com. Delete the test submission.
- [ ] **SSL** — https://app.netlify.com/projects/getamp/configuration/domain → certificate shows valid with auto-renew; `https://getampdigital.com` and `https://www.getampdigital.com` both load without warnings and redirect to the canonical host.
- [ ] **Deploys** — last 30 days of deploys all green; no stray "failed" or stuck builds.
- [ ] **Clones current** — Zach and Pedro run `cd ~/repos/getamp && git pull` (or `git -C $HOME\repos\getamp pull` on Windows) and reply with the short hash from `git log -1 --oneline`; it must match `main`. Anyone with an uncommitted local change should push or discard it.
- [ ] **Precheck** — run `scripts/precheck.ps1` (or `.sh`) on `main`; it should be clean.
- [ ] **Backlog** — skim `docs/backlog.md`; close anything shipped, add anything new.
- [ ] **Links** — spot-check external embeds (Vimeo/YouTube in SetPoint, Outset, Public Citizen) still play.

## Access

- GitHub org `AMP-Digital-Co`, repo `getamp`. Team members need an org invite before `setup.ps1` / `setup.sh` will clone.
- Netlify project `getamp` — team access managed in Netlify; Bret is the owner of record.
- Domain DNS: ⚠️ registrar/DNS host not recorded here — add it.
