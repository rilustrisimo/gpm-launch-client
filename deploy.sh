#!/bin/bash

# Build for production
echo "Building for production..."
npm run build

# Deploy to Cloudflare Pages using Wrangler
echo "Deploying to Cloudflare Pages..."
npx wrangler pages publish dist --project-name=gravitypointmedia-launch --commit-dirty=true

echo "Deployment complete!"
