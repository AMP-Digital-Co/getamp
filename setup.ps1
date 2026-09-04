# AMP Digital site — one-time setup (Windows)
# Run in PowerShell:  irm https://raw.githubusercontent.com/AMP-Digital-Co/getamp/main/setup.ps1 | iex
$ErrorActionPreference = 'Stop'
$repo = 'AMP-Digital-Co/getamp'
$dest = Join-Path $HOME 'repos\getamp'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { winget install --id Git.Git -e --silent --accept-source-agreements --accept-package-agreements }
if (-not (Get-Command gh  -ErrorAction SilentlyContinue)) { winget install --id GitHub.cli -e --silent --accept-source-agreements --accept-package-agreements }
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

gh auth status 2>$null; if ($LASTEXITCODE -ne 0) { gh auth login --hostname github.com --git-protocol https --web }
gh auth setup-git

if (-not (git config --global user.name))  { git config --global user.name  (Read-Host 'Your name') }
if (-not (git config --global user.email)) { git config --global user.email (Read-Host 'Your @getampdigital.com email') }

New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
if (Test-Path $dest) { git -C $dest pull } else { gh repo clone $repo $dest }

Write-Host "`nDone. Site repo: $dest" -ForegroundColor Green
Write-Host "Edit files, then:  git add -A; git commit -m 'what changed'; git push   ->  live on getampdigital.com in ~10s."
