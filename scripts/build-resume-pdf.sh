#!/usr/bin/env bash
# Prints resume/resume.html to public/Cristian Ariza - Resume.pdf with headless Chrome.
# Override the browser with CHROME_PATH if it isn't in a standard location.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT/resume/resume.html"
OUTPUT="$ROOT/public/Cristian Ariza - Resume.pdf"

find_chrome() {
  if [[ -n "${CHROME_PATH:-}" ]]; then
    echo "$CHROME_PATH"
    return
  fi

  local candidates=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  )
  for candidate in "${candidates[@]}"; do
    [[ -x "$candidate" ]] && { echo "$candidate"; return; }
  done

  for binary in google-chrome chromium chromium-browser; do
    command -v "$binary" >/dev/null 2>&1 && { command -v "$binary"; return; }
  done

  echo "Chrome not found. Set CHROME_PATH." >&2
  exit 1
}

CHROME="$(find_chrome)"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$OUTPUT" \
  "file://$SOURCE" 2>/dev/null

echo "Resume written to $OUTPUT"
