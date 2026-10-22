#!/usr/bin/env bash
#
# Reports one monitored step of the annotator walk to Instatus.
#
# One script for the three monitors — roof analysis, 3D generation, PDF export — because they only
# ever differed in which specs they read and which component they speak for, and keeping three copies
# of this is what let them drift apart.
#
# It reads what the Cypress run left behind:
#   * the JUnit reports under dist/, for the failures,
#   * cypress/results/*-timing.json, for the step that took too long.
#
# And it fails closed: a run that left no report at all is an outage, not a silence. That is the one
# state a monitor must never read as healthy, and it is exactly the state a crashed suite leaves.
#
# Environment:
#   INSTATUS_API_KEY, INSTATUS_PAGE_ID, INSTATUS_COMPONENT_ID, INSTATUS_RESTORED_TMPL_ID
#   REPORT_PATTERN    extended regex the spec reports are found by, e.g. '3d.*\.cy\.ts\.xml'
#   TIMING_STEP       the measured step this component answers for, e.g. '3d-generation'
#   MAX_DURATION_MS   how long that step may take before it is called slow
#   OUTAGE_NAME       incident title for a failure
#   SLOW_NAME         incident title for a step that is merely slow

set -euo pipefail

for required in INSTATUS_API_KEY INSTATUS_PAGE_ID INSTATUS_COMPONENT_ID INSTATUS_RESTORED_TMPL_ID REPORT_PATTERN TIMING_STEP MAX_DURATION_MS OUTAGE_NAME SLOW_NAME; do
  if [ -z "${!required:-}" ]; then
    echo "Missing $required" >&2
    exit 1
  fi
done

REPORTS=$(find dist -type f -name '*.xml' 2>/dev/null | grep -E "$REPORT_PATTERN" || true)

if [ -z "$REPORTS" ]; then
  # No report is not "no failure": the suite never got far enough to write one.
  ERROR_MESSAGE="No test report matched '${REPORT_PATTERN}'. The suite did not run to the end — see the workflow logs."
else
  ERROR_MESSAGE=$(python3 - "$REPORTS" <<'PY'
import sys
import xml.etree.ElementTree as ET

files = [line for line in sys.argv[1].splitlines() if line]
messages = []

for file in files:
    try:
        root = ET.parse(file).getroot()
        for node in root.findall(".//failure") + root.findall(".//error"):
            message = node.attrib.get("message", "").strip() or (node.text or "").strip()
            if message:
                messages.append(f"[{file}] {message.replace(chr(10), ' ')[:800]}")
    except Exception as error:
        messages.append(f"[{file}] XML parse error: {error}")

print("\n".join(messages)[:4000])
PY
  )
fi

SLOW_MESSAGE=$(python3 - "$TIMING_STEP" "$MAX_DURATION_MS" <<'PY'
import glob
import json
import sys

step, limit = sys.argv[1], int(sys.argv[2])
messages = []

for file in sorted(glob.glob("cypress/results/*-timing.json")):
    try:
        with open(file) as handle:
            report = json.load(handle)
        # Only the step this component answers for: a slow export says nothing about the 3D generation.
        for timing in report.get("timings", []):
            if timing.get("step") != step:
                continue
            duration = timing.get("ms", 0)
            if duration > limit:
                messages.append(f"[{file}] {timing.get('spec')} - {step} took {duration}ms (limit {limit}ms)")
    except Exception as error:
        messages.append(f"[{file}] JSON parse error: {error}")

print("\n".join(messages)[:4000])
PY
)

# per_page, because an active incident that falls off the first page would be opened a second time.
ACTIVE_INCIDENT_ID=$(curl -fsSL \
  -H "Authorization: Bearer ${INSTATUS_API_KEY}" \
  "https://api.instatus.com/v1/${INSTATUS_PAGE_ID}/incidents?page=0&per_page=100" |
  jq -r --arg COMPONENT "$INSTATUS_COMPONENT_ID" '
    map(select((.status != "RESOLVED") and ((.components // []) | map(.id) | index($COMPONENT))))
    | first | .id // empty
  ')

raise() {
  local name="$1" message="$2" impact="$3"

  if [ -n "$ACTIVE_INCIDENT_ID" ]; then
    echo "Incident already active: $ACTIVE_INCIDENT_ID"
    echo "$message"
    return
  fi

  echo "Opening a $impact incident: $name"
  echo "$message"
  local payload
  payload=$(jq -n --arg name "$name" --arg message "$message" --arg component "$INSTATUS_COMPONENT_ID" --arg impact "$impact" '{
    name: $name,
    status: "INVESTIGATING",
    message: $message,
    components: [$component],
    statuses: [{ id: $component, status: $impact }]
  }')

  curl -fsSL \
    -X POST \
    -H "Authorization: Bearer ${INSTATUS_API_KEY}" \
    -H "Content-Type: application/json" \
    "https://api.instatus.com/v1/${INSTATUS_PAGE_ID}/incidents" \
    -d "$payload"
}

if [ -n "$ERROR_MESSAGE" ]; then
  raise "$OUTAGE_NAME" "$ERROR_MESSAGE" MAJOROUTAGE
elif [ -n "$SLOW_MESSAGE" ]; then
  raise "$SLOW_NAME" "$SLOW_MESSAGE" PARTIALOUTAGE
elif [ -n "$ACTIVE_INCIDENT_ID" ]; then
  echo "Resolving incident $ACTIVE_INCIDENT_ID"
  curl -fsSL -o /dev/null \
    -X POST \
    -H "Authorization: Bearer ${INSTATUS_API_KEY}" \
    "https://api.instatus.com/v2/${INSTATUS_PAGE_ID}/incidents/${ACTIVE_INCIDENT_ID}/incident-updates/${INSTATUS_RESTORED_TMPL_ID}"
else
  echo "No active incident."
fi
