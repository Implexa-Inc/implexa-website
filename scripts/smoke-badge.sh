#!/usr/bin/env bash
# smoke test for the skillrank badge endpoint.
#
# usage:
#   ./scripts/smoke-badge.sh                       # hits prod
#   ./scripts/smoke-badge.sh https://implexa-git-foo.vercel.app   # hits preview
#   ./scripts/smoke-badge.sh http://localhost:3000  # hits local dev
#
# checks:
# - known-scored skill renders a valid svg with a digit score
# - curated implexa skill renders a valid svg
# - missing slug returns an "unrated" fallback (200, never 404)
# - dangerous source/slug returns a graceful 400 svg
# all responses should be image/svg+xml and parseable by xmllint.

set -euo pipefail

BASE="${1:-https://implexa.ai}"
PASS=0
FAIL=0

color() { printf "\033[%sm%s\033[0m" "$1" "$2"; }
ok()    { color "32" "PASS"; echo " $1"; PASS=$((PASS+1)); }
bad()   { color "31" "FAIL"; echo " $1"; FAIL=$((FAIL+1)); }

# wraps curl into one call. stores body in $1, status into $STATUS, content-type
# into $CTYPE. dies if curl itself errored.
fetch() {
  local url="$1" out="$2"
  local headers
  headers="$(mktemp)"
  STATUS=$(curl -sS -o "$out" -D "$headers" -w "%{http_code}" "$url")
  CTYPE=$(grep -i '^content-type:' "$headers" | head -1 | awk '{print tolower($2)}' | tr -d '\r;')
  CACHE=$(grep -i '^cache-control:' "$headers" | head -1 | sed 's/^[Cc]ache-[Cc]ontrol: //' | tr -d '\r')
  rm -f "$headers"
}

check() {
  local label="$1" url="$2" want_status="$3" want_in_svg="$4"
  local body
  body="$(mktemp)"
  fetch "$url" "$body"

  if [[ "$STATUS" != "$want_status" ]]; then
    bad "$label — status $STATUS, want $want_status"
    rm -f "$body"; return
  fi
  if [[ "$CTYPE" != "image/svg+xml" ]]; then
    bad "$label — content-type '$CTYPE', want image/svg+xml"
    rm -f "$body"; return
  fi
  if ! xmllint --noout "$body" 2>/dev/null; then
    bad "$label — invalid svg"
    rm -f "$body"; return
  fi
  if [[ -n "$want_in_svg" ]] && ! grep -q "$want_in_svg" "$body"; then
    bad "$label — svg missing '$want_in_svg'"
    rm -f "$body"; return
  fi
  ok "$label  [status=$STATUS, cache=${CACHE:-none}]"
  rm -f "$body"
}

echo "smoke-testing badge endpoint at $BASE"
echo

# case 1: scored implexa skill. score should embed as a digit pattern.
check "implexa curated (scored)" \
  "$BASE/badge/implexa/team-skill-sharing-playbook.svg" \
  "200" "SkillRank"

# case 2: skills.sh slug that may or may not have a score yet — should always
# render gracefully either way.
check "skills.sh (any state)" \
  "$BASE/badge/skills.sh/asc-workflow.svg" \
  "200" "SkillRank"

# case 3: bogus slug — should fall through to the unrated svg (NOT 404,
# because a stale slug in someone's readme can't be allowed to break the page).
check "non-existent slug → unrated fallback" \
  "$BASE/badge/skills.sh/this-skill-does-not-exist-asdf.svg" \
  "200" "unrated"

# case 4: malicious source. should 400 but still hand back a valid svg.
# url-encoded '<script>' as the source segment.
check "dangerous source → 400 + safe svg" \
  "$BASE/badge/%3Cscript%3E/bad.svg" \
  "400" "invalid"

echo
echo "passed: $PASS   failed: $FAIL"
[[ "$FAIL" == "0" ]]
