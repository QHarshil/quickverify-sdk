# QuickVerify SDK - Architecture Documentation

## Overview

QuickVerify SDK is built with a clean, layered architecture following the MVVM (Model-View-ViewModel) pattern for the native iOS implementation and providing a type-safe TypeScript interface for React Native integration.

## Architecture Layers

### 1. iOS Native Module (Swift)

The native iOS layer handles all device-specific functionality including camera access, biometric authentication, and document processing.

#### Core Components

**Location:** `ios/QuickVerifySDK/Core/`

- **QuickVerifyBiometricManager.swift**: Wraps `LAContext` for Face ID / Touch ID checks and prompts.
- **QuickVerifyDocumentCapture.swift**: Owns `AVCaptureSession`, Vision-based rectangle detection, overlays, and JPEG persistence.

#### ViewModels (MVVM Pattern)

**Location:** `ios/QuickVerifySDK/ViewModels/`

- **VerificationViewModel.swift**: Manages verification state and coordinates between Core components
  - Uses Combine framework for reactive state management
  - Publishes state changes to UI layer
  - Handles verification lifecycle

#### Models

**Location:** `ios/QuickVerifySDK/Models/`

- **VerificationResult.swift**: Data model for verification results
  - Encapsulates success/failure state
  - Contains biometric and document capture status
  - Provides dictionary conversion for bridge communication

#### Bridge Layer

**Location:** `ios/QuickVerifySDK/Bridge/` and `android/src/main/java/com/quickverify/`

- **QuickVerifySDK.h / .m**: Objective-C header + implementation exposed to React Native.
- **QuickVerifySDK-Bridging-Header.h**: Swift-Objective-C bridging header.
- **QuickverifySdkModule.kt**: Kotlin module that wires biometric + document capture methods.
- **QuickverifyBiometricActivity.kt**: FragmentActivity wrapper for `BiometricPrompt`.

### 2. React Native Bridge

The bridge layer provides seamless communication between native iOS code and JavaScript.

**Key Features:**
- Method exposure via RCT_EXPORT_METHOD
- Event emission for real-time updates
- Promise-based async operations
- Type-safe parameter passing

### 3. TypeScript SDK Layer

**Location:** `src/`

The TypeScript layer provides a developer-friendly API with full type safety.

#### Main SDK Interface

**File:** `src/index.ts`

- **QuickVerifySDK class**: Singleton pattern for SDK instance management
- **Convenience functions**: Top-level exports for common operations
- **Type definitions**: Full TypeScript interfaces and types

#### React Hooks

**Location:** `src/hooks/`

- **useVerification.ts**: React hook for verification flow
  - Manages verification state
  - Provides loading and error states
  - Simplifies SDK integration in React components

#### Type Definitions

**Location:** `src/types/`

- **index.d.ts**: Complete TypeScript definitions
  - Interface definitions for all SDK methods
  - Type-safe configuration objects
  - Result type definitions

### 4. Example Application

**Location:** `example/`

The example app demonstrates SDK integration and best practices.

#### Components

- **App.tsx**: Sets up routing between the overview, action, and results screens.
- **screens/HomeScreen.tsx**: Displays biometric availability and entry CTA.
- **screens/VerificationScreen.tsx**: Hosts the buttons that trigger each SDK feature.
- **screens/ResultScreen.tsx**: Presents the payload from the last action.

State is managed with local React hooks—no Redux or global store required.

## Data Flow

### Verification Flow

```
User Action (React Native)
    ↓
TypeScript SDK (src/index.ts)
    ↓
Native Bridge (Swift/Obj-C/Kotlin)
    ↓
ViewModel / Native Controllers
    ↓
Core Services (Vision, AVFoundation, MediaStore, BiometricPrompt)
    ↓
Result propagates back up the chain
```

### Event Flow

```
Native Event (Document Detected)
    ↓
Bridge Event Emitter
    ↓
TypeScript Event Listener
    ↓
React Component Update
```

## Design Patterns

### 1. Singleton Pattern

The SDK uses a singleton pattern to ensure a single, consistent configuration throughout the application lifecycle.

```typescript
const sdk = QuickVerifySDK.getInstance(config);
```

### 2. MVVM Pattern

The iOS native layer follows MVVM for clear separation of concerns:
- **Model**: Data structures (VerificationResult)
- **View**: UI components (DocumentCaptureViewController)
- **ViewModel**: Business logic and state (VerificationViewModel)

### 3. Observer Pattern

Uses Combine framework for reactive state management and event propagation.

### 4. Bridge Pattern

Abstracts platform-specific implementations behind a unified TypeScript interface.

## Security Considerations

### Biometric Data

- All biometric authentication happens on-device
- No biometric data is transmitted or stored
- Uses iOS LocalAuthentication framework
- Complies with Apple security guidelines

### Document Images

- Images stored locally with secure file paths
- No automatic transmission to external servers
- Developer controls image lifecycle
- Temporary files cleaned up automatically

## Performance Characteristics

### Camera Preview
- 30 FPS real-time preview
- Minimal latency for document detection
- Efficient memory usage (< 50 MB)

### Biometric Authentication
- < 1 second response time
- Native iOS performance
- No additional overhead

### Document Processing
- < 2 seconds for edge detection
- On-device Vision framework processing
- No network dependency

## Testing Strategy

### Unit Tests
- Core component testing
- ViewModel state management tests
- Model serialization tests

### Integration Tests
- Bridge communication tests
- End-to-end verification flow tests
- Error handling tests

### Example App
- Manual testing platform
- Visual verification of UI
- Real device testing

## Future Enhancements

### Planned Features
- Vision-style edge overlay on Android to match the iOS UX
- Additional document type presets (passport, driver's license, etc.)
- OCR + liveness utilities as optional add-ons
- Detox/e2e coverage for the React Native example

### Architecture Evolution
- Modular plugin system
- Configurable processing pipeline
- Enhanced error recovery
- Offline mode support

## Dependencies

### iOS Native
- LocalAuthentication.framework
- Vision.framework
- AVFoundation.framework
- UIKit.framework

### Android Native
- AndroidX Biometric
- MediaStore (for URI persistence)
- Camera intent (system)

### React Native / JS
- React Native 0.70.0+
- React 18+
- Jest + ts-jest for tests

### Development
- Swift 5.9 / Xcode 15
- Kotlin 1.9 / AGP 8.6
- TypeScript 5.6
- CocoaPods + Gradle

## Build Configuration

### iOS
- Minimum deployment target: iOS 13.0
- Swift version: 5.9
- Cocoapods integration via `quickverify-sdk.podspec`

### Android
- `compileSdkVersion`/`targetSdkVersion` 34
- Kotlin 1.9.24
- Uses the library's `android/build.gradle` during autolinking

### React Native / JS
- Metro bundler + Babel
- `npm run build` emits `lib/` prior to publishing

## Deployment

### NPM Package
- Published / installed as `@quickverify/react-native-sdk`
- Includes `lib/` output plus both native folders
- `npm run prepare` builds TypeScript automatically

### CocoaPods
- Podspec included in package
- Automatic dependency resolution
- Framework integration

## Support and Maintenance

### Documentation
- API Reference
- Installation Guide
- Example Application
- Architecture Documentation (this file)

### Community
- GitHub Issues
- Email Support
- Example Code Repository

---

**Last Updated:** November 2025  
**Version:** 1.0.0  
**Maintainer:** QuickVerify Team
