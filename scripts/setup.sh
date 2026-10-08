#!/usr/bin/env bash
# Usage: scripts/setup.sh <skill> [git-ref]
# Builds workspace/<skill>/.claude/skills/{<skill>,<siblings>} from a ref of the skills repo.
# Siblings come from skills/<skill>/skill.yaml (`siblings: [...]`).
# SKILLS=off builds an empty workspace for the no-skill arm.
# SKILLS_REPO (default ~/repos/ai/adobe/skills) must be a clone containing the ref;
# SKILLS_PATH (default plugins/web/skills) is where skills live inside it.
set -euo pipefail
skill=${1:?usage: setup.sh <skill> [git-ref]}
ref=${2:-origin/main}
repo=${SKILLS_REPO:-$HOME/repos/ai/adobe/skills}
path=${SKILLS_PATH:-plugins/web/skills}
root=$(cd "$(dirname "$0")/.." && pwd)
base=$root/workspace/$skill/.claude/skills
depth=$(awk -F/ '{print NF}' <<<"$path/x")

siblings=$(node -e "
  const {parse}=require('yaml');
  const c=parse(require('fs').readFileSync('$root/skills/$skill/skill.yaml','utf8'));
  console.log((c.siblings||[]).join(' '))")

rm -rf "$root/workspace/$skill"
if [[ ${SKILLS:-on} == off ]]; then
  mkdir -p "$root/workspace/$skill"
  echo "$skill: no-skill arm, empty workspace"
  exit 0
fi
for s in "$skill" $siblings; do
  mkdir -p "$base/$s"
  git -C "$repo" archive "$ref" "$path/$s" | tar -x --strip-components="$depth" -C "$base/$s"
  if [[ -f $base/$s/package-lock.json ]] && jq -e '(.dependencies // {}) | length > 0' "$base/$s/package.json" >/dev/null; then
    npm ci --prefix "$base/$s" --silent
  fi
done
echo "$skill (+ ${siblings:-no siblings}) @ $(git -C "$repo" rev-parse --short "$ref") -> $base"
