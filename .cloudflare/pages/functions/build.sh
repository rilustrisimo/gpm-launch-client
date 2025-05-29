#!/bin/bash
# Override Cloudflare's default build behavior
echo "Overriding default build command"
cd "$PWD"
bash ./cloudflare-build.sh
