#!/usr/bin/env bash
# Run this in your terminal to start the dev server.
# Ensures Homebrew Node is on PATH (common after "brew install node").

# Add Homebrew to PATH (Apple Silicon and Intel)
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

cd "$(dirname "$0")/.." || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Try:"
  echo "  1. Restart Cursor (quit fully and reopen)"
  echo "  2. Or in a new terminal run: source ~/.zshrc  then run this script again"
  echo "  3. Or run: brew doctor  and  brew link node"
  exit 1
fi

echo "Node: $(node -v)  npm: $(npm -v)"
echo "Installing dependencies..."
npm install
echo "Starting dev server..."
npm run dev
