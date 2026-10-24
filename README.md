# Skip AI Shorts

Safari (and Chrome/Firefox) web extension that auto-skips YouTube Shorts
carrying YouTube's "Altered or synthetic content" (AI) label.

YouTube exposes that label only inside the Shorts player, not in the feed,
so the extension skips such shorts while you scroll instead of hiding them
from the home page.

## Install in Safari (macOS)

1. Install Xcode.
2. `./convert.sh` — generates an Xcode project in `build/`.
3. Open the project in Xcode, pick the macOS scheme, press **Run**.
4. Safari → Settings → Advanced → enable *Show features for web developers*,
   then Develop → *Allow Unsigned Extensions* (resets on every Safari restart
   unless the app is signed with a developer team).
5. Safari → Settings → Extensions → enable **Skip AI Shorts** and allow it on youtube.com.

For iPhone/iPad, run the iOS scheme on a device (needs a signing team), then
enable it in Settings → Apps → Safari → Extensions.

## Chrome / Firefox

Load the `extension/` folder as an unpacked extension.

## If it stops working

YouTube changes its markup. Open an AI-labelled short, inspect the label and
update `MARKERS` / `ACTIVE` in `extension/content.js`.
