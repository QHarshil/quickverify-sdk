import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@quickverify/react-native-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const QuickVerifyModule = NativeModules.QuickVerifySDK
  ? NativeModules.QuickVerifySDK
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const eventEmitter = new NativeEventEmitter(QuickVerifyModule);

// Types
export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: 'faceID' | 'touchID' | 'none';
}

export interface DocumentCaptureResult {
  success: boolean;
  imageUri?: string;
  corners?: Array<{ x: number; y: number }>;
  error?: string;
}

export interface VerificationConfig {
  enableFaceID?: boolean;
  documentTypes?: Array<'passport' | 'id_card' | 'drivers_license'>;
  captureQuality?: 'low' | 'medium' | 'high';
  timeout?: number;
}

export interface VerificationResult {
  success: boolean;
  biometricVerified: boolean;
  documentCaptured: boolean;
  documentImageUri?: string;
  error?: string;
}

// SDK Class
export class QuickVerifySDK {
  private static instance: QuickVerifySDK;
  private config: VerificationConfig;

  private constructor(config: VerificationConfig = {}) {
    this.config = {
      enableFaceID: true,
      documentTypes: ['passport', 'id_card', 'drivers_license'],
      captureQuality: 'high',
      timeout: 30000,
      ...config,
    };
  }

  public static getInstance(config?: VerificationConfig): QuickVerifySDK {
    if (!QuickVerifySDK.instance) {
      QuickVerifySDK.instance = new QuickVerifySDK(config);
    }
    return QuickVerifySDK.instance;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  public async isBiometricAvailable(): Promise<boolean> {
    try {
      return await QuickVerifyModule.isBiometricAvailable();
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Authenticate user with Face ID or Touch ID
   */
  public async authenticateWithBiometric(
    reason: string = 'Verify your identity'
  ): Promise<BiometricResult> {
    try {
      const result = await QuickVerifyModule.authenticateWithBiometric(reason);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Biometric authentication failed',
      };
    }
  }

  /**
   * Capture document with automatic edge detection
   */
  public async captureDocument(): Promise<DocumentCaptureResult> {
    try {
      const result = await QuickVerifyModule.captureDocument(this.config);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Document capture failed',
      };
    }
  }

  /**
   * Perform full verification flow (biometric + document capture)
   */
  public async performVerification(): Promise<VerificationResult> {
    try {
      // Step 1: Biometric authentication
      let biometricVerified = false;
      if (this.config.enableFaceID) {
        const biometricResult = await this.authenticateWithBiometric();
        biometricVerified = biometricResult.success;
        
        if (!biometricVerified) {
          return {
            success: false,
            biometricVerified: false,
            documentCaptured: false,
            error: biometricResult.error,
          };
        }
      }

      // Step 2: Document capture
      const documentResult = await this.captureDocument();
      
      if (!documentResult.success) {
        return {
          success: false,
          biometricVerified,
          documentCaptured: false,
          error: documentResult.error,
        };
      }

      return {
        success: true,
        biometricVerified,
        documentCaptured: true,
        documentImageUri: documentResult.imageUri,
      };
    } catch (error: any) {
      return {
        success: false,
        biometricVerified: false,
        documentCaptured: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Subscribe to document capture events
   */
  public onDocumentDetected(callback: (corners: Array<{ x: number; y: number }>) => void) {
    return eventEmitter.addListener('onDocumentDetected', callback);
  }

  /**
   * Subscribe to processing events
   */
  public onProcessing(callback: (status: string) => void) {
    return eventEmitter.addListener('onProcessing', callback);
  }

  /**
   * Update SDK configuration
   */
  public updateConfig(config: Partial<VerificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current SDK configuration
   */
  public getConfig(): VerificationConfig {
    return { ...this.config };
  }
}

// Export convenience functions
export const initialize = (config?: VerificationConfig): QuickVerifySDK => {
  return QuickVerifySDK.getInstance(config);
};

export const isBiometricAvailable = async (): Promise<boolean> => {
  const sdk = QuickVerifySDK.getInstance();
  return sdk.isBiometricAvailable();
};

export const authenticateWithBiometric = async (
  reason?: string
): Promise<BiometricResult> => {
  const sdk = QuickVerifySDK.getInstance();
  return sdk.authenticateWithBiometric(reason);
};

export const captureDocument = async (): Promise<DocumentCaptureResult> => {
  const sdk = QuickVerifySDK.getInstance();
  return sdk.captureDocument();
};

export const performVerification = async (): Promise<VerificationResult> => {
  const sdk = QuickVerifySDK.getInstance();
  return sdk.performVerification();
};

export default QuickVerifySDK;

