#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="$(tr -d '[:space:]' < "$ROOT_DIR/.nvmrc")"
NVM_NODE_DIR="$HOME/.nvm/versions/node/v$NODE_VERSION/bin"

if [ -x "$NVM_NODE_DIR/node" ]; then
  export PATH="$NVM_NODE_DIR:$PATH"
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh"
  nvm use "$NODE_VERSION" >/dev/null
else
  echo "Node $NODE_VERSION is required. Install it with nvm or update .nvmrc." >&2
  exit 1
fi

export PATH="$ROOT_DIR/node_modules/.bin:$PATH"

exec "$@"
