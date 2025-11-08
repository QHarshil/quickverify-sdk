# QuickVerify React Native SDK

A lightweight, portfolio-ready identity verification SDK for React Native with native Swift **and** Kotlin bridges backed by a typed TypeScript surface.

## Features

- **Cross-platform native modules**: Swift 5.9 on iOS and Kotlin/Jetpack on Android with a shared React Native module name.
- **Biometric authentication**: Face ID + Touch ID via `LocalAuthentication` plus Android's `BiometricPrompt`.
- **Document capture**: Vision-based edge detection on iOS and high-resolution camera capture on Android with real file persistence.
- **Real-time events**: Document detection + processing callbacks exposed to JS through `NativeEventEmitter`.
- **Typed SDK + hooks**: Singleton helper, React hook, and full `.d.ts` coverage.
- **Example application**: Multi-screen React Native demo that exercises every SDK call.

## Installation

### NPM

```bash
npm install @quickverify/react-native-sdk
```

### Yarn

```bash
yarn add @quickverify/react-native-sdk
```

### iOS Setup

```bash
cd ios && pod install
```

Add the following to your `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required to capture identity documents</string>
<key>NSFaceIDUsageDescription</key>
<string>Face ID is used to verify your identity</string>
```

### Android Setup

1. Declare camera permission in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

2. Request the permission at runtime before calling `captureDocument` (the SDK will surface an error if it is missing).
3. Ensure your project uses `compileSdkVersion`/`targetSdkVersion` 34 or newer so the library Gradle config matches.

## Quick Start

### Basic Usage

```typescript
import { QuickVerifySDK } from '@quickverify/react-native-sdk';

// Initialize SDK
const sdk = QuickVerifySDK.getInstance({
  enableFaceID: true,
  captureQuality: 'high',
  timeout: 30000,
});

// Perform full verification
const result = await sdk.performVerification();

if (result.success) {
  console.log('Verification successful');
  console.log('Document URI:', result.documentImageUri);
}
```

### Biometric Authentication Only

```typescript
import { authenticateWithBiometric } from '@quickverify/react-native-sdk';

const result = await authenticateWithBiometric('Verify your identity');

if (result.success) {
  console.log('Authenticated with:', result.biometryType);
}
```

### Document Capture Only

```typescript
import { captureDocument } from '@quickverify/react-native-sdk';

const result = await captureDocument();

if (result.success) {
  console.log('Document captured:', result.imageUri);
  console.log('Detected corners:', result.corners);
}
```

## Verification & Tooling

Automated tooling lives in `package.json` and is exercised on every edit. Latest local run (macOS, Node 25.1.0):

```bash
npm run test   # Jest + ts-jest unit tests (pass)
npm run build  # TypeScript build that emits lib/

# Landing site sanity check
cd ../quickverify-complete/quickverify-landing
npm run build  # Vite production build (pass)
```

Lockfiles for both packages are committed so reviewers can reproduce these commands exactly.

## API Reference

### QuickVerifySDK

#### Methods

##### `getInstance(config?: VerificationConfig): QuickVerifySDK`

Get singleton instance of the SDK.

**Parameters:**
- `config` (optional): Configuration object

**Returns:** SDK instance

##### `isBiometricAvailable(): Promise<boolean>`

Check if biometric authentication is available on the device.

**Returns:** Promise resolving to boolean

##### `authenticateWithBiometric(reason?: string): Promise<BiometricResult>`

Authenticate user with Face ID or Touch ID.

**Parameters:**
- `reason` (optional): Reason for authentication shown to user

**Returns:** Promise resolving to BiometricResult

##### `captureDocument(): Promise<DocumentCaptureResult>`

Capture document with automatic edge detection.

**Returns:** Promise resolving to DocumentCaptureResult

##### `performVerification(): Promise<VerificationResult>`

Perform full verification flow (biometric + document capture).

**Returns:** Promise resolving to VerificationResult

##### `onDocumentDetected(callback: Function): Subscription`

Subscribe to document detection events.

**Parameters:**
- `callback`: Function called when document is detected

**Returns:** Subscription object with `remove()` method

##### `onProcessing(callback: Function): Subscription`

Subscribe to processing status events.

**Parameters:**
- `callback`: Function called during processing

**Returns:** Subscription object with `remove()` method

### Types

#### VerificationConfig

```typescript
interface VerificationConfig {
  enableFaceID?: boolean;
  documentTypes?: Array<'passport' | 'id_card' | 'drivers_license'>;
  captureQuality?: 'low' | 'medium' | 'high';
  timeout?: number;
}
```

#### BiometricResult

```typescript
interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: 'faceID' | 'touchID' | 'none';
}
```

#### DocumentCaptureResult

```typescript
interface DocumentCaptureResult {
  success: boolean;
  imageUri?: string;
  corners?: Array<{ x: number; y: number }>;
  error?: string;
}
```

#### VerificationResult

```typescript
interface VerificationResult {
  success: boolean;
  biometricVerified: boolean;
  documentCaptured: boolean;
  documentImageUri?: string;
  error?: string;
}
```

## Architecture

### Native iOS Layer

- **QuickVerifyBiometricManager**: Handles Face ID/Touch ID authentication
- **QuickVerifyDocumentCapture**: Manages camera and document detection
- **Vision Framework**: Provides rectangle detection for documents
- **AVFoundation**: Handles camera capture

### Native Android Layer

- **QuickverifySdkModule**: React Native module exposing camera + biometric methods.
- **QuickverifyBiometricActivity**: FragmentActivity wrapper around Android's `BiometricPrompt`.
- **Document capture flow**: Launches the system camera, saves the file URI, and streams processing events back to JS.

### React Native Bridge

- **QuickVerifySDK.m**: Objective-C bridge module
- **QuickverifySdkPackage.kt**: Autolinking entry point on Android
- **RCTEventEmitter**: Event system for real-time updates

### TypeScript Layer

- **QuickVerifySDK**: Main SDK class with singleton pattern
- **Type Definitions**: Full TypeScript support
- **Event System**: Subscribe to document detection and processing events

## Example App

The repository ships with a multi-screen React Native example that:

- Shows an overview screen with biometric availability.
- Runs full verification, biometric-only, and document-only actions on a dedicated screen.
- Displays the payload on a results screen so reviewers can inspect the data without digging into logs.

Run it with the usual React Native commands:

```bash
cd example
npm install
cd ios && pod install && cd ..
npm run ios
# or npm run android
```

## Requirements

- iOS 13.0+ (Swift 5.9 / Xcode 15)
- Android 13 (API 33)+ with Kotlin 1.9 support
- React Native 0.70.0+

## Permissions

The SDK requires the following permissions:

- **Camera**: For document capture
- **Face ID**: For biometric authentication (if enabled)
- **Android Camera**: Declared in `AndroidManifest.xml` and requested at runtime

## Error Handling

All SDK methods return results with error information:

```typescript
const result = await sdk.performVerification();

if (!result.success) {
  console.error('Verification failed:', result.error);
  
  // Handle specific errors
  if (!result.biometricVerified) {
    console.log('Biometric authentication failed');
  }
  
  if (!result.documentCaptured) {
    console.log('Document capture failed');
  }
}
```

## Best Practices

### 1. Initialize Once

```typescript
// In your app root or context
const sdk = QuickVerifySDK.getInstance({
  enableFaceID: true,
  captureQuality: 'high',
});
```

### 2. Check Availability

```typescript
const available = await sdk.isBiometricAvailable();
if (!available) {
  // Show alternative authentication method
}
```

### 3. Handle Events

```typescript
useEffect(() => {
  const subscription = sdk.onDocumentDetected((corners) => {
    // Update UI with detected document
  });
  
  return () => subscription.remove();
}, []);
```

### 4. Error Recovery

```typescript
const result = await sdk.performVerification();

if (!result.success) {
  // Allow user to retry
  Alert.alert('Verification Failed', result.error, [
    { text: 'Retry', onPress: () => sdk.performVerification() },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
```

## Platform Notes

- iOS saves captured images to the app's documents directory and returns a `file://` URI.
- Android saves the image through `MediaStore` and grants read/write URI permissions to the host app.
- The SDK performs no network requests—everything stays on device unless you upload the image yourself.

## Security

- All biometric prompts are handled by the OS—only the success flag and biometry type reach JS.
- Document images are stored locally (app documents on iOS, MediaStore URIs on Android) and only the path is returned.
- The SDK never touches the network; you control when/if to upload captured assets.

## Troubleshooting

### Pod Install Fails

```bash
cd ios
pod deintegrate
pod install
```

### Build Errors

Ensure your `Podfile` has:

```ruby
platform :ios, '13.0'
use_frameworks!
```

### Face ID Not Working

Check `Info.plist` has `NSFaceIDUsageDescription` key.

### Camera Not Working

Check `Info.plist` has `NSCameraUsageDescription` key.

## Contributing

Contributions are welcome. Please follow the existing code style and include tests for new features.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: https://github.com/QHarshil/quickverify-sdk/issues
- Landing page repo: https://github.com/QHarshil/quickverify-landing

## Changelog

### 1.0.0 (2025)

- Initial release
- Face ID/Touch ID authentication
- Document capture with edge detection
- Real-time processing feedback
- TypeScript support
- Example application

---

**Built with modern mobile development practices for production use.**
