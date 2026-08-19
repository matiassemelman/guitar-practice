#!/usr/bin/env bash

set -euo pipefail

# Smoke test deliberately restricted to local private-mode servers.
# It creates one synthetic session and always deletes it before exiting.

BASE_URL="${1:-http://127.0.0.1:3000}"

case "$BASE_URL" in
  http://127.0.0.1:*|http://localhost:*) ;;
  *)
    echo "Refusing to mutate a non-local URL: $BASE_URL" >&2
    exit 2
    ;;
esac

command -v curl >/dev/null || { echo "curl is required" >&2; exit 2; }
command -v jq >/dev/null || { echo "jq is required" >&2; exit 2; }

session_id=""

cleanup() {
  if [[ -n "$session_id" ]]; then
    curl --fail --silent --show-error \
      -X DELETE "$BASE_URL/api/sessions/$session_id" >/dev/null || true
  fi
}
trap cleanup EXIT

echo "Checking private API at $BASE_URL"

create_body='{
  "microObjective": "Security smoke: clean local transition at 60 BPM",
  "technicalFocus": "Técnica",
  "durationMin": 10,
  "bpmTarget": 60,
  "bpmAchieved": 58,
  "perfectTakes": 1,
  "qualityRating": 4,
  "rpe": 4,
  "mindsetChecklist": {
    "warmedUp": true,
    "practicedSlow": true,
    "recorded": false,
    "tookBreaks": false,
    "reviewedMistakes": true
  },
  "reflection": "Synthetic local smoke fixture"
}'

create_response="$(curl --fail --silent --show-error \
  -X POST "$BASE_URL/api/sessions" \
  -H 'Content-Type: application/json' \
  --data "$create_body")"

session_id="$(jq -er '.data.session.id' <<<"$create_response")"

curl --fail --silent --show-error \
  "$BASE_URL/api/sessions/$session_id" \
  | jq -e --argjson id "$session_id" '.data.id == $id' >/dev/null

curl --fail --silent --show-error \
  -X PUT "$BASE_URL/api/sessions/$session_id" \
  -H 'Content-Type: application/json' \
  --data '{
    "microObjective":"Security smoke: clean local transition at 60 BPM",
    "technicalFocus":"Técnica",
    "durationMin":10,
    "bpmTarget":60,
    "bpmAchieved":59,
    "qualityRating":4,
    "rpe":4,
    "mindsetChecklist":{
      "warmedUp":true,
      "practicedSlow":true,
      "recorded":false,
      "tookBreaks":false,
      "reviewedMistakes":true
    },
    "reflection":"Synthetic local smoke fixture updated"
  }' \
  | jq -e '.success == true' >/dev/null

invalid_status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  -X POST "$BASE_URL/api/ai-analysis" \
  -H 'Content-Type: application/json' \
  --data '{"analysisTypes":["unknown"],"sessionLimit":31}')"

if [[ "$invalid_status" != "400" ]]; then
  echo "Expected invalid AI request to return 400, got $invalid_status" >&2
  exit 1
fi

curl --fail --silent --show-error \
  -X DELETE "$BASE_URL/api/sessions/$session_id" >/dev/null
session_id=""

echo "Private CRUD and pre-provider AI validation passed; cleanup complete."
