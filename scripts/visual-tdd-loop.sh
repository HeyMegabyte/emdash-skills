#!/bin/bash
# Visual TDD Loop: Screenshot → GPT-4o Vision Analysis → Fix → Redeploy → Repeat
# Usage: ./visual-tdd-loop.sh <URL> [max_iterations]

set -euo pipefail
source "$HOME/.claude/hooks/style.sh" 2>/dev/null || true

URL="${1:?Usage: visual-tdd-loop.sh <URL> [max_iterations]}"
MAX_ITER="${2:-2}"
SCREENSHOT_DIR=".playwright-screenshots"
# Search for .env.local in current dir, then common locations
for ENV_LOCAL in ".env.local" "../.env.local" "$HOME/.env.local"; do
  if [ -f "$ENV_LOCAL" ] && grep -q '^OPENAI_API_KEY=' "$ENV_LOCAL" 2>/dev/null; then
    OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' "$ENV_LOCAL" | cut -d= -f2)
    break
  fi
done
# Also check CLAUDE_ENV_FILE if set
if [ -z "${OPENAI_API_KEY:-}" ] && [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -f "$CLAUDE_ENV_FILE" ]; then
  OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' "$CLAUDE_ENV_FILE" | cut -d= -f2)
fi
: "${OPENAI_API_KEY:?OPENAI_API_KEY not found}"

mkdir -p "$SCREENSHOT_DIR"

BREAKPOINTS=(
  "375:667:Mobile"
  "1280:720:Desktop"
)

screenshotAllBreakpoints() {
  local iter=$1
  for bp in "${BREAKPOINTS[@]}"; do
    IFS=: read -r w h name <<< "$bp"
    npx playwright screenshot \
      --viewport-size="${w},${h}" \
      "$URL" \
      "${SCREENSHOT_DIR}/iter${iter}-${name}.png" 2>/dev/null || true
  done
}

analyzeScreenshot() {
  local image_path=$1
  local base64_image
  base64_image=$(base64 -i "$image_path")

  curl -s "https://api.openai.com/v1/chat/completions" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"gpt-4o\",
      \"max_tokens\": 1000,
      \"messages\": [{
        \"role\": \"user\",
        \"content\": [
          {\"type\": \"text\", \"text\": \"Senior UI/UX engineer visual QA. Report ONLY actual problems. Check: layout breaks, text overflow, broken images, misalignment, poor contrast, missing content, horizontal scroll, touch targets <44px. Format: JSON array [{severity,element,description,fix}]. Return [] if clean.\"},
          {\"type\": \"image_url\", \"image_url\": {\"url\": \"data:image/png;base64,$base64_image\", \"detail\": \"low\"}}
        ]
      }]
    }" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['choices'][0]['message']['content'])" 2>/dev/null
}

emdash_header "🔍 Visual TDD Loop" "$(gum style --foreground "$BLUE" "$URL  •  max $MAX_ITER iterations")"

for ((i=1; i<=MAX_ITER; i++)); do
  gum style --foreground "$CYAN" --bold "━━━ Iteration $i/$MAX_ITER ━━━" >&2

  emdash_spin "Screenshotting at 6 breakpoints..." screenshotAllBreakpoints "$i"

  ALL_CLEAN=true
  for bp in "${BREAKPOINTS[@]}"; do
    IFS=: read -r w h name <<< "$bp"
    SCREENSHOT="${SCREENSHOT_DIR}/iter${i}-${name}.png"
    if [ -f "$SCREENSHOT" ]; then
      RESULT=$(analyzeScreenshot "$SCREENSHOT")
      if [ "$RESULT" != "[]" ] && [ -n "$RESULT" ]; then
        gum log -sl warn "Issues at $name (${w}x${h})"
        echo "$RESULT" | python3 -c "
import json, sys
try:
  issues = json.loads(sys.stdin.read())
  for issue in issues:
    sev = issue.get('severity','?')
    elem = issue.get('element','?')
    desc = issue.get('description','?')
    print(f'  {sev.upper():8s} {elem}: {desc}')
except: pass
" >&2
        ALL_CLEAN=false
      else
        emdash_success "$name (${w}x${h})"
      fi
    fi
  done

  if $ALL_CLEAN; then
    gum style --foreground "#2ECC40" --border-foreground "#2ECC40" --border rounded --padding "0 2" \
      "✅ ALL BREAKPOINTS CLEAN" "Iteration $i — zero issues found" >&2
    exit 0
  fi

  gum log -sl warn "Issues found. Fix and redeploy before iteration $((i+1))." >&2
done

gum style --foreground "#FF4136" --border-foreground "#FF4136" --border rounded --padding "0 2" \
  "⚠️  Max iterations ($MAX_ITER) reached" "Manual review needed" >&2
exit 1
