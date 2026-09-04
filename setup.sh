#!/usr/bin/env bash
# AMP Digital site — one-time setup (macOS)
# Run in Terminal:  curl -fsSL https://raw.githubusercontent.com/AMP-Digital-Co/getamp/main/setup.sh | bash
set -e
REPO=AMP-Digital-Co/getamp
DEST="$HOME/repos/getamp"

command -v brew >/dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
command -v git  >/dev/null || brew install git
command -v gh   >/dev/null || brew install gh

gh auth status >/dev/null 2>&1 || gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git

[ -n "$(git config --global user.name)"  ] || { read -rp "Your name: " n; git config --global user.name "$n"; }
[ -n "$(git config --global user.email)" ] || { read -rp "Your @getampdigital.com email: " e; git config --global user.email "$e"; }

mkdir -p "$(dirname "$DEST")"
if [ -d "$DEST" ]; then git -C "$DEST" pull; else gh repo clone "$REPO" "$DEST"; fi

echo; echo "Done. Site repo: $DEST"
echo "Edit files, then:  git add -A && git commit -m 'what changed' && git push   ->  live on getampdigital.com in ~10s."