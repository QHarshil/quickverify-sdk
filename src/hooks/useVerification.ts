import { useState, useCallback, useEffect } from 'react';
import { QuickVerifySDK, VerificationResult } from '../index';

export interface UseVerificationOptions {
  enableFaceID?: boolean;
  captureQuality?: 'low' | 'medium' | 'high';
  timeout?: number;
}

export interface UseVerificationReturn {
  isVerifying: boolean;
  result: VerificationResult | null;
  error: string | null;
  startVerification: () => Promise<void>;
  reset: () => void;
}

export function useVerification(
  options: UseVerificationOptions = {}
): UseVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sdk] = useState(() => QuickVerifySDK.getInstance(options));

  useEffect(() => {
    sdk.updateConfig(options);
  }, [sdk, options]);

  const startVerification = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const verificationResult = await sdk.performVerification();
      setResult(verificationResult);
      
      if (!verificationResult.success) {
        setError(verificationResult.error || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsVerifying(false);
    }
  }, [sdk]);

  const reset = useCallback(() => {
    setIsVerifying(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    isVerifying,
    result,
    error,
    startVerification,
    reset,
  };
}

