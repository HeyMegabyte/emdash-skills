#!/bin/bash
# Analyze a screenshot with GPT-4o Vision — deterministic structured output
# Usage: ./gpt4o-vision-analyze.sh <image_path> [prompt] [detail:low|high]
# Returns JSON analysis with evidence-grounded findings
# Research-backed: temperature:0, json_object format, evidence fields, text-before-image

set -euo pipefail
source "$HOME/.claude/hooks/style.sh" 2>/dev/null || true

IMAGE_PATH="${1:?Usage: gpt4o-vision-analyze.sh <image_path> [prompt] [detail]}"
CUSTOM_PROMPT="${2:-}"
DETAIL="${3:-low}"  # low=85 tokens (triage), high=85+170/tile (fine analysis)
ENV_LOCAL="/Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local"

if [ -f "$ENV_LOCAL" ]; then
  OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' "$ENV_LOCAL" | cut -d= -f2)
fi
: "${OPENAI_API_KEY:?OPENAI_API_KEY not found}"

# Pre-resize to max 1920x1080 (high-detail scales to 2048x2048 anyway — save bandwidth)
RESIZED=$(mktemp "$TMPDIR/gpt4o-XXXXXX.png")
if command -v sips &>/dev/null; then
  sips --resampleWidth 1920 "$IMAGE_PATH" --out "$RESIZED" 2>/dev/null || cp "$IMAGE_PATH" "$RESIZED"
else
  cp "$IMAGE_PATH" "$RESIZED"
fi

BASE64_IMAGE=$(base64 -i "$RESIZED")
rm -f "$RESIZED"

# Evidence-grounded prompt with structured JSON schema (anti-hallucination)
DEFAULT_PROMPT='You are a senior UI/UX engineer. Analyze this screenshot and return ONLY valid JSON.

Schema: {
  "score": number (1-10),
  "issues": [{"severity": "critical"|"high"|"medium"|"low", "element": string, "description": string, "evidence": string (what you ACTUALLY see in the screenshot), "fix": string}],
  "accessibility": {"contrast_ok": boolean, "touch_targets_ok": boolean, "focus_visible": boolean},
  "brand_consistent": boolean,
  "summary": string (2 sentences max)
}

Check: layout (overflow, misalignment, overlap, gaps), typography (size, truncation, contrast), images (broken, stretched, placeholders), interactions (button size, link visibility, states), brand (colors, fonts, spacing), accessibility (contrast >=4.5:1, touch >=44px, focus indicators).

Every issue MUST have an "evidence" field describing what you literally see. Do not guess.'

PROMPT="${CUSTOM_PROMPT:-$DEFAULT_PROMPT}"

# Text instructions BEFORE image (research: better extraction accuracy)
# temperature:0 for deterministic QA assertions
# response_format:json_object for guaranteed valid JSON
RESPONSE=$(curl -s "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"gpt-4o\",
    \"temperature\": 0,
    \"max_tokens\": 2000,
    \"response_format\": {\"type\": \"json_object\"},
    \"messages\": [{
      \"role\": \"user\",
      \"content\": [
        {\"type\": \"text\", \"text\": $(echo "$PROMPT" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')},
        {\"type\": \"image_url\", \"image_url\": {\"url\": \"data:image/png;base64,$BASE64_IMAGE\", \"detail\": \"$DETAIL\"}}
      ]
    }]
  }")

# Extract and output
echo "$RESPONSE" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['choices'][0]['message']['content'])"
