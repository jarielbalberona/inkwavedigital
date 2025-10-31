#!/bin/sh
set -e

# Set CI environment for non-interactive pnpm
export CI=true

# Auto-install if lockfile changed or node_modules missing
if [ ! -d node_modules ] || [ pnpm-lock.yaml -nt node_modules ]; then
  echo ">> Running pnpm install (lockfile changed or node_modules missing)"
  pnpm install --frozen-lockfile || pnpm install
fi

exec "$@"

