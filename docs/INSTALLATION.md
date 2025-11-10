# QuickVerify SDK - Installation Guide

This guide provides detailed instructions for installing and configuring the QuickVerify React Native SDK.

## 1. Install the Package

Install the SDK from npm or Yarn:

### NPM
```bash
npm install @quickverify/react-native-sdk
```

### Yarn
```bash
yarn add @quickverify/react-native-sdk
```

## 2. iOS Configuration

### Install Pods

Navigate to your project's `ios` directory and run `pod install`:

```bash
cd ios
pod install
```

### Add Permissions

Open your `Info.plist` file and add the following keys and descriptions:

```xml
<key>NSCameraUsageDescription</key>
<string>Your app requires camera access to capture identity documents.</string>

<key>NSFaceIDUsageDescription</key>
<string>Your app uses Face ID to verify your identity securely.</string>
```

Replace the string values with descriptions appropriate for your app.

### Minimum iOS Version

Ensure your `Podfile` specifies a minimum iOS version of 13.0 or higher:

```ruby
platform :ios, '13.0'
```

## 3. Android Configuration

1. **Grant camera permission** in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

2. **Request the permission at runtime** before calling `captureDocument`. If the permission is missing, the SDK resolves with `{ success: false, error: 'Camera permission is required...' }`.

3. **Ensure tooling versions**: `compileSdkVersion`/`targetSdkVersion` ≥ 34, Kotlin 1.9+, and AGP 8.x (the library ships its own `android/build.gradle` for autolinking).

4. Rebuild your Android app so that Gradle picks up the new module.

## 4. Usage

Once installed, you can import and use the SDK in your React Native components:

```typescript
import { QuickVerifySDK } from '@quickverify/react-native-sdk';

const sdk = QuickVerifySDK.getInstance();

// Use SDK methods
async function verify() {
  const result = await sdk.performVerification();
  console.log(result);
}
```

## 5. Running the Playground app

The `QuickVerifyPlayground/` directory contains a fully configured React Native app that consumes the SDK via `file:..`. To run it locally:

```bash
npm install                # from the SDK root
npm run build              # generates lib/ which Metro will load

cd QuickVerifyPlayground
npm install
npx pod-install --repo-update   # first run patches boost + installs pods
npm run ios -- --simulator "iPhone 17"   # or: npm run android
```

Re-run `npm run build` at the root whenever you change the SDK so that the playground picks up the latest JS bridge.

> **Note:** The Podfile automatically rewrites React Native's bundled `boost.podspec` to download the official `boost_1_76_0.tar.bz2` archive (with a verified SHA) and adds the required C++17 compatibility flag. Flipper is disabled to keep the pod set compatible with modern Xcode versions. Always run `npx pod-install --repo-update` after installing JS dependencies so the patch can apply before CocoaPods resolves dependencies.

> **Metro tip:** The playground now ships with a monorepo-aware `metro.config.js` that explicitly watches the SDK root and pins `@quickverify/react-native-sdk` to the compiled `lib/index.js`. Whenever you change the SDK, rerun `npm run build` at the root so Metro sees fresh output, then restart the bundler with `npx react-native start --reset-cache` (freeing port 8081 first with `lsof -n -i :8081 | xargs kill` if needed).

## Troubleshooting

### `pod install` fails

1. Ensure you have CocoaPods installed (`sudo gem install cocoapods`).
2. Try updating your CocoaPods master repo: `pod repo update`.
3. Delete `Podfile.lock` and the `Pods` directory, then run `pod install` again.

### Build fails in Xcode

1. Clean your build folder (Product > Clean Build Folder).
2. Ensure you are opening the `.xcworkspace` file, not the `.xcodeproj` file.
3. Check that the Swift version in the Podspec matches your project's Swift version.

For further assistance, please open an issue on our [GitHub repository](https://github.com/QHarshil/quickverify-sdk/issues).
