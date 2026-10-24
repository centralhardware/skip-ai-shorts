# Skip AI Shorts

Safari (and Chrome/Firefox) web extension that auto-skips YouTube Shorts
carrying YouTube's "Altered or synthetic content" (AI) label.

YouTube exposes that label only inside the Shorts player, not in the feed,
so the extension skips such shorts while you scroll instead of hiding them
from the home page.

## Quick install: prebuilt app (no Xcode)

GitHub Actions builds the macOS app on every push; tagged versions are
attached to [Releases](https://github.com/centralhardware/skip-ai-shorts/releases).

```sh
cd ~/Downloads
curl -LO https://github.com/centralhardware/skip-ai-shorts/releases/latest/download/Skip-AI-Shorts-macOS.zip
ditto -x -k Skip-AI-Shorts-macOS.zip /Applications
xattr -dr com.apple.quarantine /Applications/SkipAIShorts.app   # app is ad-hoc signed, not notarized
open /Applications/SkipAIShorts.app
```

Then do steps 5–7 below (allow unsigned extensions, enable it, test).

To cut a new release: `git tag v1.0.1 && git push --tags`.

## Build it yourself (macOS), step by step

**1. Install Xcode** (from the App Store, or via the command line):

```sh
xcode-select --install          # command line tools
open "macappstore://apps.apple.com/app/id497799835"   # full Xcode, required
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

**2. Clone the repo:**

```sh
git clone https://github.com/centralhardware/skip-ai-shorts.git
cd skip-ai-shorts
```

**3. Generate the Safari project:**

```sh
./convert.sh
```

**4. Build and install the app** (from the terminal, no need to open Xcode):

```sh
cd build/SkipAIShorts
xcodebuild -scheme "SkipAIShorts (macOS)" -configuration Release \
  -derivedDataPath ../dd CODE_SIGN_IDENTITY="-" build
open ../dd/Build/Products/Release/SkipAIShorts.app
```

Or open the project in Xcode (`open *.xcodeproj`), pick the
*SkipAIShorts (macOS)* scheme and press **Run** (⌘R).

**5. Let Safari load an unsigned extension:**

- Safari → Settings → Advanced → enable *Show features for web developers*
- Menu bar: Develop → *Allow Unsigned Extensions* (asks for your password)

This switch resets every time Safari restarts. To avoid that, sign the app
with your Apple ID: Xcode → target → Signing & Capabilities → Team.

**6. Enable the extension:**

- Safari → Settings → Extensions → tick **Skip AI Shorts**
- Click *Edit Websites…* → youtube.com → *Allow*

**7. Test:** open youtube.com/shorts and scroll. AI-labelled shorts are
skipped. In the console (Develop → Show JavaScript Console) every skip
logs as `[skip-ai-shorts] skipping /shorts/…` (verbose level).

### Updating

```sh
git pull && ./convert.sh   # then repeat step 4
```

### iPhone / iPad

Open the project in Xcode, set a Team under Signing & Capabilities, pick the
*SkipAIShorts (iOS)* scheme with your device and press Run. Then enable it
in Settings → Apps → Safari → Extensions → Skip AI Shorts → allow youtube.com.

## Chrome / Firefox

Load the `extension/` folder as an unpacked extension.

## If it stops working

YouTube changes its markup. Open an AI-labelled short, inspect the label and
update `MARKERS` / `ACTIVE` in `extension/content.js`.
