#!/usr/bin/env sh
set -eu
for f in docs/spec.md docs/architecture.md docs/data-model.md docs/assumptions.md docs/roadmap.md docs/decisions/README.md; do
  test -f "$f" || { echo "Missing required documentation: $f"; exit 1; }
done
echo "Documentation baseline present."
