# QuickVerify SDK - API Reference

This document provides a detailed reference for the QuickVerify React Native SDK API.

## Table of Contents

1. [Initialization](#initialization)
2. [Core Classes](#core-classes)
   - [QuickVerifySDK](#quickverifysdk)
3. [Convenience Functions](#convenience-functions)
4. [Type Definitions](#type-definitions)
5. [Event System](#event-system)

---

## Initialization

The SDK is initialized using a singleton pattern to ensure a single, consistent configuration throughout your application.

### `initialize(config?: VerificationConfig): QuickVerifySDK`

Initializes and returns the singleton instance of the `QuickVerifySDK`.

**Parameters:**
- `config` (optional): A `VerificationConfig` object to configure the SDK.

**Returns:** The singleton `QuickVerifySDK` instance.

**Example:**
```typescript
import { initialize } from '@quickverify/react-native-sdk';

const sdk = initialize({
  enableFaceID: true,
  captureQuality: 'high',
  timeout: 30000,
});
```

---

## Core Classes

### QuickVerifySDK

The main class for interacting with the SDK.

#### `getInstance(config?: VerificationConfig): QuickVerifySDK`

Static method to get the singleton instance of the SDK. If an instance doesn't exist, it will be created with the provided configuration.

**Parameters:**
- `config` (optional): `VerificationConfig` object.

**Returns:** The `QuickVerifySDK` instance.

---

#### `isBiometricAvailable(): Promise<boolean>`

Checks if biometric authentication (Face ID or Touch ID) is available and configured on the device.

**Returns:** A `Promise` that resolves to `true` if biometrics are available, `false` otherwise.

**Example:**
```typescript
const isAvailable = await sdk.isBiometricAvailable();
if (isAvailable) {
  console.log('Biometric authentication is available.');
}
```

---

#### `authenticateWithBiometric(reason?: string): Promise<BiometricResult>`

Prompts the user to authenticate using Face ID or Touch ID.

**Parameters:**
- `reason` (optional): A string explaining why the app is requesting authentication. This is displayed to the user.

**Returns:** A `Promise` that resolves to a `BiometricResult` object.

**Example:**
```typescript
const result = await sdk.authenticateWithBiometric('Verify your identity to proceed');
if (result.success) {
  console.log(`Authenticated with ${result.biometryType}`);
}
```

---

#### `captureDocument(): Promise<DocumentCaptureResult>`

Opens the native document capture UI. This feature includes automatic edge detection and provides a cropped image of the document.

**Returns:** A `Promise` that resolves to a `DocumentCaptureResult` object.

**Example:**
```typescript
const result = await sdk.captureDocument();
if (result.success) {
  console.log('Document captured successfully:', result.imageUri);
}
```

---

#### `performVerification(): Promise<VerificationResult>`

Executes the complete verification flow, which includes biometric authentication followed by document capture.

**Returns:** A `Promise` that resolves to a `VerificationResult` object.

**Example:**
```typescript
const result = await sdk.performVerification();
if (result.success) {
  console.log('Full verification successful!');
}
```

---

#### `updateConfig(config: Partial<VerificationConfig>): void`

Updates the SDK's configuration dynamically.

**Parameters:**
- `config`: A partial `VerificationConfig` object with the settings to update.

**Example:**
```typescript
sdk.updateConfig({ timeout: 60000 });
```

---

#### `getConfig(): VerificationConfig`

Retrieves the current SDK configuration.

**Returns:** The current `VerificationConfig` object.

---

## Convenience Functions

For ease of use, the SDK also exports top-level functions that internally use the singleton instance.

- `isBiometricAvailable(): Promise<boolean>`
- `authenticateWithBiometric(reason?: string): Promise<BiometricResult>`
- `captureDocument(): Promise<DocumentCaptureResult>`
- `performVerification(): Promise<VerificationResult>`

---

## Type Definitions

### `VerificationConfig`

Configuration object for the SDK.

```typescript
interface VerificationConfig {
  enableFaceID?: boolean; // Default: true
  documentTypes?: Array<'passport' | 'id_card' | 'drivers_license'>; // Default: all
  captureQuality?: 'low' | 'medium' | 'high'; // Default: 'high'
  timeout?: number; // Default: 30000 (ms)
}
```

### `BiometricResult`

Result of a biometric authentication attempt.

```typescript
interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: 'faceID' | 'touchID' | 'none';
}
```

### `DocumentCaptureResult`

Result of a document capture attempt.

```typescript
interface DocumentCaptureResult {
  success: boolean;
  imageUri?: string; // Local file URI of the captured document
  corners?: Array<{ x: number; y: number }>; // Detected corners of the document
  error?: string;
}
```

### `VerificationResult`

Result of the full verification flow.

```typescript
interface VerificationResult {
  success: boolean;
  biometricVerified: boolean;
  documentCaptured: boolean;
  documentImageUri?: string;
  error?: string;
}
```

---

## Event System

The SDK uses an event emitter to provide real-time feedback during the document capture process.

### `onDocumentDetected(callback: (corners: Array<{ x: number; y: number }>) => void)`

Subscribes to an event that fires whenever the document's edges are detected in the camera view.

**Parameters:**
- `callback`: A function that receives an array of corner coordinates.

**Returns:** A subscription object with a `remove()` method to unsubscribe.

**Example:**
```typescript
useEffect(() => {
  const subscription = sdk.onDocumentDetected((corners) => {
    console.log('Document corners detected:', corners);
  });

  return () => subscription.remove();
}, []);
```

### `onProcessing(callback: (status: string) => void)`

Subscribes to processing events, such as when the captured image is being processed.

**Parameters:**
- `callback`: A function that receives the current processing status.

**Returns:** A subscription object with a `remove()` method.

**Example:**
```typescript
useEffect(() => {
  const subscription = sdk.onProcessing((status) => {
    console.log('Processing status:', status);
  });

  return () => subscription.remove();
}, []);
```

