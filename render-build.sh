#!/usr/bin/env bash
set -e
nvm_version=""
if [ -f .nvmrc ]; then
  nvm_version=$(cat .nvmrc)
  echo "Using Node version $nvm_version"
  if command -v nvm >/dev/null 2>&1; then
    nvm install "$nvm_version"
    nvm use "$nvm_version"
  fi
fi
npm install
npm run build