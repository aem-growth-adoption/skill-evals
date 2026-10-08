#!/usr/bin/env bash
# Usage: scripts/setup.sh <skill> [git-ref]
# Builds workspace/<skill>/.claude/skills/<skill> from a ref of the skills repo.
# SKILLS_REPO (default ~/repos/ai/adobe/skills) must be a clone containing the ref;
# SKILLS_PATH (default plugins/web/skills) is where skills live inside it.
set -euo pipefail
skill=${1:?usage: setup.sh <skill> [git-ref]}
ref=${2:-origin/main}
repo=${SKILLS_REPO:-$HOME/repos/ai/adobe/skills}
path=${SKILLS_PATH:-plugins/web/skills}
root=$(cd "$(dirname "$0")/.." && pwd)
dest=$root/workspace/$skill/.claude/skills/$skill
rm -rf "$root/workspace/$skill"
mkdir -p "$dest"
depth=$(awk -F/ '{print NF}' <<<"$path/$skill")
git -C "$repo" archive "$ref" "$path/$skill" | tar -x --strip-components="$depth" -C "$dest"
echo "$skill @ $(git -C "$repo" rev-parse --short "$ref") -> $dest"
