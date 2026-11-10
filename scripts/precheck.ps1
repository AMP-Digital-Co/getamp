# precheck.ps1 - pre-push checklist for getampdigital.com
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File scripts\precheck.ps1
# Works in Windows PowerShell 5.1 and pwsh 7. Step 0 (minify) needs Node/npx; skipped with a warning without it.
# Exit code 0 = clean, 1 = failures (warnings alone do not fail).
#
# Checks: 0 minified assets (regenerates .min.js/.min.css)
#         1 HTML validity (structural)  2 local asset references  3 sitemap vs pages
#         4 Netlify form markup          5 viewport meta            6 CHANGELOG touched
#         7 CSP: inline scripts allow-listed by hash, no inline handlers
#
# Optional: -Strict runs html-validate via npx if node is installed (needs network).

param([switch]$Strict)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$fail = 0; $warn = 0
function Fail($m) { Write-Host "  FAIL  $m" -ForegroundColor Red;    $script:fail++ }
function Warn($m) { Write-Host "  warn  $m" -ForegroundColor Yellow; $script:warn++ }
function Ok($m)   { Write-Host "  ok    $m" -ForegroundColor Green }
function Head($m) { Write-Host "`n[$m]" -ForegroundColor Cyan }

$pages = @(Get-ChildItem -Path $root -Filter *.html -File) + @(Get-ChildItem -Path (Join-Path $root 'case-studies') -Filter *.html -File)
$rel = { param($p) $p.Substring($root.Length + 1).Replace('\', '/') }

# ---------- 0. Minified assets ----------
# Sources are assets/js/*.js and assets/css/style.css; pages load the committed .min files.
# Tool versions are pinned so every machine and CI produce identical output.
Head '0. Minified assets'
$terser = 'terser@5.51.2'; $esbuild = 'esbuild@0.28.2'
if (Get-Command npx -ErrorAction SilentlyContinue) {
  $minOk = $true
  foreach ($j in 'main', 'amp-invaders') {
    cmd /c "npx --yes $terser assets/js/$j.js --compress --mangle --output assets/js/$j.min.js 2>&1" | Out-Null
    if ($LASTEXITCODE -ne 0) { $minOk = $false }
  }
  cmd /c "npx --yes $terser assets/js/amp-toy.js --module --compress --mangle --output assets/js/amp-toy.min.js 2>&1" | Out-Null
  if ($LASTEXITCODE -ne 0) { $minOk = $false }
  cmd /c "npx --yes $esbuild assets/css/style.css --minify --log-level=error --outfile=assets/css/style.min.css 2>&1" | Out-Null
  if ($LASTEXITCODE -ne 0) { $minOk = $false }
  $minDirty = if (Get-Command git -ErrorAction SilentlyContinue) { @(git -C $root diff --name-only -- 'assets/js/*.min.js' 'assets/css/*.min.css') + @(git -C $root ls-files --others --exclude-standard -- 'assets/js/*.min.js' 'assets/css/*.min.css') | Where-Object { $_ } } else { $null }
  if (-not $minOk) { Fail 'minify step errored' }
  elseif ($minDirty) {
    if ($env:CI) { Fail '.min files are stale - run precheck locally and commit the regenerated files' }
    else { Warn '.min files regenerated - commit them with your change' }
  } else { Ok '.min.js / .min.css match their sources' }
} else { Warn 'npx not found - minify skipped; .min files may be stale (install Node)' }
foreach ($p in $pages) {
  if ((Get-Content $p.FullName -Raw) -match 'assets/(js/main|css/style)\.(js|css)"') { Fail "$(& $rel $p.FullName) loads an unminified asset - point it at the .min file" }
}

# ---------- 1. HTML validity (structural heuristics) ----------
Head '1. HTML validity'
$voidTags = 'area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr'
foreach ($p in $pages) {
  $name = & $rel $p.FullName
  $html = Get-Content $p.FullName -Raw
  $bad = @()
  if ($html -notmatch '(?i)^\s*<!DOCTYPE html>') { $bad += 'missing <!DOCTYPE html>' }
  foreach ($t in 'html','head','body','title') {
    $o = ([regex]::Matches($html, "(?i)<$t[\s>]")).Count
    $c = ([regex]::Matches($html, "(?i)</$t>")).Count
    if ($o -ne 1 -or $c -ne 1) { $bad += "<$t> open=$o close=$c" }
  }
  # Balance of the tags that matter for layout. Ignores void tags and anything inside comments/scripts.
  $stripped = [regex]::Replace($html, '(?s)<!--.*?-->|<script.*?</script>|<style.*?</style>', '')
  foreach ($t in 'div','section','header','footer','nav','main','a','p','ul','li','span','button','form','h1','h2','h3','video','iframe','svg') {
    $o = ([regex]::Matches($stripped, "(?i)<$t(\s[^>]*)?>")).Count
    $c = ([regex]::Matches($stripped, "(?i)</$t\s*>")).Count
    if ($o -ne $c) { $bad += "<$t> open=$o close=$c" }
  }
  if ($stripped -match "(?i)<($voidTags)\b[^>]*>\s*</\1>") { $bad += 'closing tag on a void element' }
  if ($bad.Count) { Fail "$name - $($bad -join '; ')" } else { Ok $name }
}
if ($Strict) {
  if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host '  running html-validate (npx)...'
    & npx --yes html-validate ($pages | ForEach-Object { & $rel $_.FullName }) 2>&1 | ForEach-Object { "  $_" }
    if ($LASTEXITCODE -ne 0) { Fail 'html-validate reported errors' } else { Ok 'html-validate clean' }
  } else { Warn '-Strict requested but npx not found; skipped html-validate' }
}

# ---------- 2. Local asset references ----------
Head '2. Local asset references'
$attrRx = '(?i)\b(?:src|href|poster)\s*=\s*"([^"]+)"'
$skipRx = '^(?:https?:|mailto:|tel:|#|data:|javascript:|//|%23)'
$broken = 0
$files = @($pages) + @(Get-ChildItem (Join-Path $root 'assets\css') -Filter *.css -File)
foreach ($f in $files) {
  $txt = Get-Content $f.FullName -Raw
  $dir = $f.DirectoryName
  $refs = @()
  if ($f.Extension -eq '.css') {
    $refs = [regex]::Matches($txt, 'url\(\s*["'']?([^"'')]+)["'']?\s*\)') | ForEach-Object { $_.Groups[1].Value }
  } else {
    $refs = [regex]::Matches($txt, $attrRx) | ForEach-Object { $_.Groups[1].Value }
  }
  foreach ($r in ($refs | Select-Object -Unique)) {
    if ($r -match $skipRx) { continue }
    $clean = ($r -split '[?#]')[0]
    if (-not $clean) { continue }
    $target = if ($clean.StartsWith('/')) { Join-Path $root $clean.TrimStart('/') } else { Join-Path $dir $clean }
    if (-not (Test-Path $target)) { Fail "$(& $rel $f.FullName) -> $r"; $broken++ }
  }
}
if ($broken -eq 0) { Ok "all local src/href/poster/url() references resolve ($($files.Count) files)" }

# ---------- 3. Sitemap vs pages ----------
Head '3. sitemap.xml vs pages'
$sm = Get-Content (Join-Path $root 'sitemap.xml') -Raw
$inSitemap = [regex]::Matches($sm, '<loc>\s*https://getampdigital\.com/?([^<\s]*)\s*</loc>') | ForEach-Object { $_.Groups[1].Value }
$inSitemap = $inSitemap | ForEach-Object { if ($_ -eq '' -or $_ -eq 'index.html') { 'index.html' } else { $_ } }
$onDisk = $pages | ForEach-Object { & $rel $_.FullName } | Where-Object { $_ -ne '404.html' }
$missing = $onDisk | Where-Object { $inSitemap -notcontains $_ }
$stale   = $inSitemap | Where-Object { $onDisk -notcontains $_ }
foreach ($m in $missing) { Fail "page not in sitemap: $m" }
foreach ($s in $stale)   { Fail "sitemap lists a page that doesn't exist: $s" }
if (-not $missing -and -not $stale) { Ok "sitemap matches $($onDisk.Count) pages" }

# ---------- 4. Netlify form markup ----------
Head '4. Netlify form markup'
$idx = Get-Content (Join-Path $root 'index.html') -Raw
$formChecks = @{
  'form name="contact"'          = '<form[^>]*\bname="contact"';
  'data-netlify="true"'          = '<form[^>]*\bdata-netlify="true"';
  'netlify-honeypot="bot-field"' = '<form[^>]*\bnetlify-honeypot="bot-field"';
  'hidden form-name input'       = '<input[^>]*name="form-name"[^>]*value="contact"';
  'honeypot input bot-field'     = '<input[^>]*name="bot-field"';
  'method="POST"'                = '<form[^>]*\bmethod="POST"';
}
foreach ($k in $formChecks.Keys) {
  if ($idx -match "(?i)$($formChecks[$k])") { Ok $k } else { Fail "missing: $k" }
}
$formCount = ([regex]::Matches($idx, '(?i)<form\b')).Count
if ($formCount -ne 1) { Fail "expected exactly 1 <form> in index.html, found $formCount" }

# ---------- 5. Viewport meta ----------
Head '5. Viewport meta (mobile sanity)'
foreach ($p in $pages) {
  $html = Get-Content $p.FullName -Raw
  if ($html -match '(?i)<meta\s+name="viewport"\s+content="width=device-width') { Ok (& $rel $p.FullName) } else { Fail "no viewport meta: $(& $rel $p.FullName)" }
}
Write-Host '  note  visual mobile check is manual: view changed pages at ~390px before pushing.'

# ---------- 6. CHANGELOG touched ----------
Head '6. CHANGELOG.md'
if (Get-Command git -ErrorAction SilentlyContinue) {
  $changed = @(git -C $root status --porcelain | ForEach-Object { $_.Substring(3).Trim() })
  # compare against origin/main so this also works on a new branch with no upstream yet
  $ahead = @(); try { $ahead = @(cmd /c "git -C `"$root`" diff --name-only origin/main...HEAD 2>nul") } catch { }
  $touched = ($changed + $ahead) | Where-Object { $_ }
  $contentChanged = $touched | Where-Object { $_ -ne 'CHANGELOG.md' -and $_ -notmatch '^docs/' -and $_ -notmatch '^scripts/' }
  if ($contentChanged -and ($touched -notcontains 'CHANGELOG.md')) { Warn 'site files changed but CHANGELOG.md not updated - add one line' }
  elseif ($touched) { Ok 'CHANGELOG.md updated (or only docs/scripts changed)' }
  else { Ok 'no pending changes' }
} else { Warn 'git not found; skipped changelog check' }

# ---------- 7. CSP: inline scripts and handlers ----------
# netlify.toml's CSP has no 'unsafe-inline' for scripts: every inline <script> must be allow-listed
# there by hash, and inline event handlers are blocked outright.
Head '7. CSP (inline scripts and handlers)'
$toml = [IO.File]::ReadAllText((Join-Path $root 'netlify.toml'))
$sha = [Security.Cryptography.SHA256]::Create()
$cspOk = $true
foreach ($p in $pages) {
  $name = & $rel $p.FullName
  $html = [IO.File]::ReadAllText($p.FullName)
  foreach ($m in [regex]::Matches($html, '(?is)<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>')) {
    $body = $m.Groups[1].Value.Replace("`r", '')
    $h = [Convert]::ToBase64String($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($body)))
    if (-not $toml.Contains("'sha256-$h'")) { Fail "${name}: inline <script> not allow-listed in netlify.toml CSP - add 'sha256-$h' (ask Bret first)"; $cspOk = $false }
  }
  $noScript = [regex]::Replace($html, '(?s)<!--.*?-->|<script.*?</script>|<style.*?</style>', '')
  if ($noScript -match '(?i)\son[a-z]+\s*="') { Fail "${name}: inline event handler (on...=) is blocked by the CSP - move it into main.js"; $cspOk = $false }
}
if ($cspOk) { Ok 'inline scripts are allow-listed by hash; no inline event handlers' }

# ---------- summary ----------
Write-Host ''
if ($fail -eq 0) { Write-Host "PRECHECK PASSED ($warn warning(s))" -ForegroundColor Green; exit 0 }
else { Write-Host "PRECHECK FAILED - $fail failure(s), $warn warning(s)" -ForegroundColor Red; exit 1 }
