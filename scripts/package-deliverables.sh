#!/usr/bin/env bash
# Package a task deliverable: the starting code (input 1) and the finished code (final output 1).
#
# Usage: npm run deliverables -- [input-ref] [output-ref]
#   input-ref   defaults to HEAD^1, the main branch before the last merged pull request
#   output-ref  defaults to HEAD
set -euo pipefail

input_ref="${1:-HEAD^1}"
output_ref="${2:-HEAD}"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# Only tracked files are archived, so node_modules, .env and build output are excluded.
git archive --prefix="input 1/" "${input_ref}^{tree}" | tar -x -C "$work"
git archive --prefix="final output 1/" "${output_ref}^{tree}" | tar -x -C "$work"

mkdir -p archives
output="$PWD/archives/deliverables.zip"
rm -f "$output"
(cd "$work" && zip -qr "$output" .)

echo "Created archives/deliverables.zip"
echo "  input 1:        $(git rev-parse --short "$input_ref")"
echo "  final output 1: $(git rev-parse --short "$output_ref")"
