# AMP Digital — getampdigital.com

Static site (HTML/CSS/JS, no build step). Hosted on Netlify, deployed automatically from `main`.
**Pushing to `main` = live on getampdigital.com in about 10 seconds.**

## First-time setup (once per computer)
Windows — open PowerShell and run:
```
irm https://raw.githubusercontent.com/AMP-Digital-Co/getamp/main/setup.ps1 | iex
```
Mac — open Terminal and run:
```
curl -fsSL https://raw.githubusercontent.com/AMP-Digital-Co/getamp/main/setup.sh | bash
```
Installs Git + GitHub CLI, signs you into GitHub in your browser, and clones the site to `~/repos/getamp`.
You must accept the AMP-Digital-Co org invite in your GitHub email first.

## Making a change
```
cd ~/repos/getamp
git pull
# edit files
git add -A
git commit -m "what changed"
git push
```
Check https://app.netlify.com/projects/getamp/deploys if the change doesn't show up.

## Editing with Claude
`CLAUDE.md` tells Claude how the site is put together. Use Claude Code in the repo folder, or ask Claude in the AMP website Project to make and push changes.

## Contact form
Netlify Forms (`contact`). Submissions and notification emails are managed in the Netlify dashboard, not in code.
