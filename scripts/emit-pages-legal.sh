#!/usr/bin/env bash
# After `vite build`, copy the SPA shell to directory indexes.
# GitHub Pages serves `privacy/index.html` as HTTP 200.
# Copying the same file to `404.html` still responds HTTP 404, which Apple
# review rejects for Privacy / Support URLs.
#
# Paths match src/App.tsx: privacy, support, impressum, and the DE alias datenschutz.
# `npm run build` stays unchanged; deploy-pages.sh calls this script.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="${1:-$ROOT/dist}"
if [[ "$DIST" != /* ]]; then
  DIST="$ROOT/$DIST"
fi

if [[ ! -f "$DIST/index.html" ]]; then
  echo "emit-pages-legal: missing $DIST/index.html — run npm run build first" >&2
  exit 1
fi

PATHS=(privacy support impressum datenschutz)

for seg in "${PATHS[@]}"; do
  mkdir -p "$DIST/$seg"
  cp "$DIST/index.html" "$DIST/$seg/index.html"
done

echo "emit-pages-legal: ${PATHS[*]}"
