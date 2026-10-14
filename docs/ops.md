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
- Netlify project `getamp` (shown as "getampdigital.com") lives in the **analytics@getampdigital.com** Netlify team, not bret@ where AMP's other projects are. Repo is linked through Bret's GitHub account (relinked 2026-09-15).

### Netlify account consolidation (to do once)

Goal: `getamp` in the bret@ Netlify team with everything else.

Blocker (checked 2026-09-15): both the bret@ team and the analytics@ team are on Netlify's **Free** plan, which is single-member ("Upgrade to add members"). Self-serve transfer requires being an Owner/Developer on both teams, so it is not possible without a plan change.

Options, in order of preference:

1. **Netlify Support transfer** (free, keeps domain/Forms/deploy history). Post in https://answers.netlify.com (Support category) from the bret@ login: project slug `getamp`, custom domain `getampdigital.com`, source team = analytics@getampdigital.com's team, destination team slug `bret-iclevzg`, state that you own both logins and both are Free/single-member. Typically turns around in a few days. Then update this file.
2. **Recreate under bret@** (~15 min, self-serve, loses form-submission and deploy history). In bret@: Add new project → import `AMP-Digital-Co/getamp`, no build command, publish `.`. In analytics@: Domain management → remove `getampdigital.com` / `www`. In bret@: add the domain, wait for SSL, re-add the Forms notification to hello@getampdigital.com, then delete the old project.
3. **Upgrade one team to Pro** — unlimited seats on credit-based Pro; only worth it if AMP wants a shared Netlify workspace anyway.

Until one of these is done, the project is reachable only via the analytics@ login. Keep those credentials in 1Password (AMP Digital vault).
## Deploy Preview troubleshooting

Symptom: a PR's Netlify check fails in seconds with `git ref pull/N/head does not exist or you do not have permission` at "preparing repo", while pushes to `main` deploy fine.

Cause: the Netlify↔GitHub repo link is using a GitHub identity that can't read the org's PR refs — not the code. GitHub App permissions (org settings → GitHub Apps → Netlify → `getamp` selected) are usually already correct.

Fix: Netlify → Project configuration → Build & deploy → Continuous deployment → **Manage repository → Link to a different repository** → authorize with a GitHub account that's a member of `AMP-Digital-Co` → pick `getamp` / `main`, no build command, publish dir `.`. Then push an empty commit to the PR branch (`git commit --allow-empty -m "retrigger" && git push`) and confirm `gh pr checks N` goes green.

Fast workaround if the link can't be fixed right away: Branches and deploy contexts → Configure → Branch deploys → add the feature branch. Branch deploys use `refs/heads` and don't hit the PR-ref problem.
- Domain DNS: ⚠️ registrar/DNS host not recorded here — add it.
