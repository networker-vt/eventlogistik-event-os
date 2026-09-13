#!/usr/bin/env bash
# Build + force-push production dist to gh-pages (GitHub Pages).
# Vite base MUST stay /eventlogistik-event-os/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> npm ci / install"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> build"
npm run build

echo "==> SPA fallback 404.html"
cp dist/index.html dist/404.html

BRANCH="gh-pages"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> prepare $BRANCH worktree"
cp -a dist/. "$TMP/"
# Keep a minimal marker for Pages
touch "$TMP/.nojekyll"

# Prefer gh-pages remote branch history reset via orphan commit
git -C "$TMP" init -q
git -C "$TMP" checkout -q -b "$BRANCH"
git -C "$TMP" -c user.name="networker-vt" -c user.email="networker-vt@users.noreply.github.com" add -A
git -C "$TMP" -c user.name="networker-vt" -c user.email="networker-vt@users.noreply.github.com" \
  commit -q -m "deploy: GitHub Pages $(date -u +%Y-%m-%dT%H:%MZ)"

REMOTE="$(git remote get-url origin)"
echo "==> force-push $BRANCH → $REMOTE"
git -C "$TMP" push -f "$REMOTE" "$BRANCH:$BRANCH"

PAGES_URL="https://networker-vt.github.io/eventlogistik-event-os/"
echo ""
echo "✅ Pages deployed: $PAGES_URL"
echo "   (Custom domain: set in GitHub → Settings → Pages, then DNS CNAME)"
