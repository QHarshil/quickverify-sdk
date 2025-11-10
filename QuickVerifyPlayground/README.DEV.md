QuickVerifyPlayground — local development notes

This document describes how to run the playground locally and why certain steps are required.

Overview
--------
The playground consumes the SDK as a local package (via `file:..`). To run the playground reliably:

- The SDK must be built so `lib/index.js` exists.
- Metro must watch the SDK source or be pointed at the compiled entry.
- CocoaPods must be installed for iOS native code.

Local run steps
---------------
From the repository root:

```bash
# 1) Build the SDK
cd quickverify-sdk
npm install
npm run build

# 2) Install and prepare the playground
cd QuickVerifyPlayground
npm install
npx pod-install --repo-update   # macOS / iOS only

# 3) Start the bundler (from the playground folder)
npx react-native start --reset-cache

# 4) Launch the app (in another terminal)
npx react-native run-ios
```

Troubleshooting
---------------
- If Metro reports `@react-native/metro-config` missing, install it in the playground:

  ```bash
  cd QuickVerifyPlayground
  npm install --save-dev @react-native/metro-config
  ```

- If the playground cannot resolve `@quickverify/react-native-sdk`:
  - Confirm `quickverify-sdk/lib/index.js` exists. If not, run `npm run build` at the SDK root.
  - Start Metro from the `QuickVerifyPlayground/` directory so `metro.config.js` is picked up.
  - If native code changed, re-run `cd ios && pod install` in the playground.

Notes on scripts
----------------
- `scripts/ensure-sdk-built.js` is a small helper that checks for `lib/index.js` and runs `npm run build` in the SDK root if missing. The playground `package.json` runs this via `postinstall` and before `start`/`ios`/`android` scripts.
- The shebang `#!/usr/bin/env node` at the top of that script is a standard Unix convention to run the file with Node.js. It is not a sign of automated content; it is industry-standard.

Security note
-------------
Run `npm audit` and fix advisories intentionally; update packages in CI or in a controlled manner.
