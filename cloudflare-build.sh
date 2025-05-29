#!/bin/bash
# This script bypasses Cloudflare's default build behavior
echo "Running custom build script for Cloudflare Pages..."

# Run the custom install without frozen lockfile
echo "Installing dependencies..."
bun install

# Run the build
echo "Building production app..."
npm run build:prod

# Success message
echo "Build completed successfully."
