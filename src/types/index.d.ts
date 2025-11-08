declare module '@quickverify/react-native-sdk' {
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

  export class QuickVerifySDK {
    static getInstance(config?: VerificationConfig): QuickVerifySDK;
    isBiometricAvailable(): Promise<boolean>;
    authenticateWithBiometric(reason?: string): Promise<BiometricResult>;
    captureDocument(): Promise<DocumentCaptureResult>;
    performVerification(): Promise<VerificationResult>;
    onDocumentDetected(callback: (corners: Array<{ x: number; y: number }>) => void): { remove: () => void };
    onProcessing(callback: (status: string) => void): { remove: () => void };
    updateConfig(config: Partial<VerificationConfig>): void;
    getConfig(): VerificationConfig;
  }

  export function initialize(config?: VerificationConfig): QuickVerifySDK;
  export function isBiometricAvailable(): Promise<boolean>;
  export function authenticateWithBiometric(reason?: string): Promise<BiometricResult>;
  export function captureDocument(): Promise<DocumentCaptureResult>;
  export function performVerification(): Promise<VerificationResult>;
}

