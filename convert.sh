#!/bin/sh
# Wraps the web extension into an Xcode project Safari can load (macOS + Xcode required).
set -e
cd "$(dirname "$0")"
xcrun safari-web-extension-converter extension \
  --project-location build \
  --app-name "Skip AI Shorts" \
  --bundle-identifier me.centralhardware.SkipAIShorts \
  --swift --no-open --force "$@"
echo "Open the generated .xcodeproj under build/ in Xcode and press Run."
