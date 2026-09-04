#!/usr/bin/env bash
# precheck.sh - pre-push checklist for getampdigital.com (macOS/Linux twin of precheck.ps1)
# Run:  bash scripts/precheck.sh [--strict]
# Exit 0 = clean, 1 = failures. Needs only bash, grep, sed. --strict runs html-validate via npx if available.

set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
STRICT=0; [ "${1:-}" = "--strict" ] && STRICT=1
FAIL=0; WARN=0
red=$'\e[31m'; grn=$'\e[32m'; yel=$'\e[33m'; cyn=$'\e[36m'; rst=$'\e[0m'
fail(){ printf '  %sFAIL%s  %s\n' "$red" "$rst" "$1"; FAIL=$((FAIL+1)); }
warn(){ printf '  %swarn%s  %s\n' "$yel" "$rst" "$1"; WARN=$((WARN+1)); }
ok(){   printf '  %sok%s    %s\n' "$grn" "$rst" "$1"; }
head_(){ printf '\n%s[%s]%s\n' "$cyn" "$1" "$rst"; }

PAGES=( *.html case-studies/*.html )
strip(){ # remove comments, scripts, styles
  perl -0777 -pe 's/<!--.*?-->//gs; s/<script.*?<\/script>//gs; s/<style.*?<\/style>//gs' "$1"
}
count(){ grep -oiE "$2" <<<"$1" | wc -l | tr -d ' '; }

# ---------- 1. HTML validity ----------
head_ '1. HTML validity'
for p in "${PAGES[@]}"; do
  bad=""
  html="$(cat "$p")"
  grep -qiE '^\s*<!DOCTYPE html>' "$p" || bad+="missing <!DOCTYPE html>; "
  for t in html head body title; do
    o=$(count "$html" "<$t[[:space:]>]"); c=$(count "$html" "</$t>")
    [ "$o" = 1 ] && [ "$c" = 1 ] || bad+="<$t> open=$o close=$c; "
  done
  s="$(strip "$p")"
  for t in div section header footer nav main a p ul li span button form h1 h2 h3 video iframe svg; do
    o=$(count "$s" "<$t([[:space:]][^>]*)?>"); c=$(count "$s" "</$t[[:space:]]*>")
    [ "$o" = "$c" ] || bad+="<$t> open=$o close=$c; "
  done
  if [ -n "$bad" ]; then fail "$p - $bad"; else ok "$p"; fi
done
if [ $STRICT = 1 ]; then
  if command -v npx >/dev/null; then
    echo '  running html-validate (npx)...'
    if npx --yes html-validate "${PAGES[@]}" 2>&1 | sed 's/^/  /'; then ok 'html-validate clean'; else fail 'html-validate reported errors'; fi
  else warn '--strict requested but npx not found'; fi
fi

# ---------- 2. Local asset references ----------
head_ '2. Local asset references'
broken=0
for f in "${PAGES[@]}" assets/css/*.css; do
  dir="$(dirname "$f")"
  if [[ "$f" == *.css ]]; then
    refs=$(grep -oE 'url\(\s*["'"'"']?[^"'"'"')]+' "$f" | sed -E 's/^url\(\s*["'"'"']?//')
  else
    refs=$(grep -oiE '\b(src|href|poster)\s*=\s*"[^"]+"' "$f" | sed -E 's/^[^"]*"//; s/"$//')
  fi
  while IFS= read -r r; do
    [ -z "$r" ] && continue
    [[ "$r" =~ ^(https?:|mailto:|tel:|#|data:|javascript:|//|%23) ]] && continue
    clean="${r%%[?#]*}"; [ -z "$clean" ] && continue
    if [[ "$clean" == /* ]]; then target="$ROOT/${clean#/}"; else target="$dir/$clean"; fi
    if [ ! -e "$target" ]; then fail "$f -> $r"; broken=$((broken+1)); fi
  done <<<"$(printf '%s\n' "$refs" | sort -u)"
done
[ $broken = 0 ] && ok 'all local src/href/poster/url() references resolve'

# ---------- 3. Sitemap vs pages ----------
head_ '3. sitemap.xml vs pages'
in_sitemap=$(grep -oE '<loc>\s*https://getampdigital\.com/?[^<[:space:]]*' sitemap.xml | sed -E 's#.*getampdigital\.com/?##; s#^$#index.html#')
on_disk=$(printf '%s\n' "${PAGES[@]}" | grep -v '^404.html$')
miss=$(comm -23 <(sort <<<"$on_disk") <(sort <<<"$in_sitemap"))
stale=$(comm -13 <(sort <<<"$on_disk") <(sort <<<"$in_sitemap"))
for m in $miss;  do fail "page not in sitemap: $m"; done
for s in $stale; do fail "sitemap lists a page that doesn't exist: $s"; done
[ -z "$miss$stale" ] && ok "sitemap matches $(wc -l <<<"$on_disk" | tr -d ' ') pages"

# ---------- 4. Netlify form markup ----------
head_ '4. Netlify form markup'
chk(){ if grep -qiE "$2" index.html; then ok "$1"; else fail "missing: $1"; fi; }
chk 'form name="contact"'          '<form[^>]*name="contact"'
chk 'data-netlify="true"'          '<form[^>]*data-netlify="true"'
chk 'netlify-honeypot="bot-field"' '<form[^>]*netlify-honeypot="bot-field"'
chk 'hidden form-name input'       '<input[^>]*name="form-name"[^>]*value="contact"'
chk 'honeypot input bot-field'     '<input[^>]*name="bot-field"'
chk 'method="POST"'                '<form[^>]*method="POST"'
fc=$(grep -oiE '<form\b' index.html | wc -l | tr -d ' ')
[ "$fc" = 1 ] || fail "expected exactly 1 <form> in index.html, found $fc"

# ---------- 5. Viewport meta ----------
head_ '5. Viewport meta (mobile sanity)'
for p in "${PAGES[@]}"; do
  grep -qiE '<meta\s+name="viewport"\s+content="width=device-width' "$p" && ok "$p" || fail "no viewport meta: $p"
done
echo '  note  visual mobile check is manual: view changed pages at ~390px before pushing.'

# ---------- 6. CHANGELOG ----------
head_ '6. CHANGELOG.md'
if command -v git >/dev/null; then
  touched=$( { git status --porcelain | cut -c4-; git diff --name-only '@{upstream}...HEAD' 2>/dev/null; } | sed '/^$/d' | sort -u)
  content=$(grep -vE '^(CHANGELOG\.md|docs/|scripts/)' <<<"$touched")
  if [ -n "$content" ] && ! grep -qx 'CHANGELOG.md' <<<"$touched"; then warn 'site files changed but CHANGELOG.md not updated - add one line'
  elif [ -n "$touched" ]; then ok 'CHANGELOG.md updated (or only docs/scripts changed)'
  else ok 'no pending changes'; fi
else warn 'git not found; skipped changelog check'; fi

echo
if [ $FAIL = 0 ]; then printf '%sPRECHECK PASSED%s (%d warning(s))\n' "$grn" "$rst" "$WARN"; exit 0
else printf '%sPRECHECK FAILED%s - %d failure(s), %d warning(s)\n' "$red" "$rst" "$FAIL" "$WARN"; exit 1; fi
