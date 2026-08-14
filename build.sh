#!/bin/bash
# Vercel Build Script for RustHash
set -e

echo "=== PREPARING RUST/WASM ENVIRONMENT ==="

# 1. Add cargo bin to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# 2. Install rustup if not present, or ensure it is fully functional
if ! command -v rustup &> /dev/null; then
  echo "rustup not found in PATH. Installing a local minimal rustup toolchain..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal --no-modify-path
  # Source the environment variables
  if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
  fi
else
  echo "rustup is already available."
fi

# Double-check rustup is now in PATH and active
if command -v rustup &> /dev/null; then
  echo "Using rustup from: $(which rustup)"
  echo "Active Rust version:"
  rustc --version

  echo "Installing wasm32-unknown-unknown target..."
  rustup target add wasm32-unknown-unknown
else
  echo "WARNING: rustup still not found after installation attempt!"
fi

echo "=== BUILDING RUST WEBASSEMBLY BINDINGS ==="
# 3. Compile Rust to WASM using wasm-pack
npx wasm-pack build rust --out-name hash_wasm --out-dir ../frontend/src/pkg --target web

echo "=== BUILDING VITE FRONTEND ==="
# 4. Compile React/Vite Frontend
npm run build:frontend

echo "=== BUILD COMPLETED SUCCESSFULLY ==="
