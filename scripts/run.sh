#!/usr/bin/env bash
# Usage: scripts/run.sh <skill> [git-ref] [provider-filter-regex]
# Runs the skill's live suite (3 repeats) and stores a summary under results/<skill>/.
set -euo pipefail
skill=${1:?usage: run.sh <skill> [git-ref] [provider-filter]}
ref=${2:-origin/main}
filter=${3:-}
cd "$(dirname "$0")/.."
scripts/setup.sh "$skill" "$ref"
out=output/$skill-$(date +%Y%m%d-%H%M%S).json
mkdir -p output
args=(-c "skills/$skill/promptfooconfig.live.yaml" --no-cache --repeat 3 -o "$out")
[[ -n $filter ]] && args+=(--filter-providers "$filter")
npx promptfoo eval "${args[@]}" || true # failing tests are benchmark data, not a script error
node scripts/summarize.mjs "$out" "$skill" "$ref"
