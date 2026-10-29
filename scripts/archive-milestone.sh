#!/usr/bin/env bash
# Package a milestone as a standalone project archive (source, migrations and tests).
#
# Usage: npm run archive -- <milestone-name> [git-ref]
#   npm run archive -- milestone-1            # archive the current HEAD
#   npm run archive -- milestone-1 v0.1.0     # archive a tag or commit
set -euo pipefail

name="${1:-}"
ref="${2:-HEAD}"

if [[ -z "$name" ]]; then
  echo "Usage: npm run archive -- <milestone-name> [git-ref]" >&2
  exit 1
fi

if [[ "$ref" == "HEAD" && -n "$(git status --porcelain)" ]]; then
  echo "Warning: uncommitted changes are not included in the archive." >&2
fi

mkdir -p archives
output="archives/equipment-reservation-${name}.zip"

# Only tracked files are archived, so node_modules, .env and build output are excluded.
git archive --format=zip --prefix="equipment-reservation-${name}/" -o "$output" "$ref"

echo "Created $output from $(git rev-parse --short "$ref")"
