#!/bin/sh
# One-time setup: makes photos optimize automatically before each commit.
cd "$(dirname "$0")/.." && cp tools/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit && echo "Installed: photos will be optimized before every commit."
