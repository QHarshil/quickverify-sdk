import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, Alert, StyleSheet } from 'react-native';
import {
  QuickVerifySDK,
  VerificationResult,
  BiometricResult,
  DocumentCaptureResult,
} from '@quickverify/react-native-sdk';
import { HomeScreen } from './screens/HomeScreen';
import { VerificationScreen } from './screens/VerificationScreen';
import { ResultMode, ResultScreen } from './screens/ResultScreen';

type Screen = 'home' | 'verification' | 'results';

type ResultPayload = {
  mode: ResultMode;
  verificationResult?: VerificationResult;
  biometricResult?: BiometricResult;
  documentResult?: DocumentCaptureResult;
};

const App = () => {
  const [sdk] = useState(() =>
    QuickVerifySDK.getInstance({
      enableFaceID: true,
      captureQuality: 'high',
    })
  );

  const [screen, setScreen] = useState<Screen>('home');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultPayload, setResultPayload] = useState<ResultPayload | null>(null);

  const checkBiometricAvailability = useCallback(async () => {
    const available = await sdk.isBiometricAvailable();
    setBiometricAvailable(available);
  }, [sdk]);

  useEffect(() => {
    checkBiometricAvailability();

    const documentListener = sdk.onDocumentDetected((corners) => {
      console.log('Document detected:', corners);
    });

    const processingListener = sdk.onProcessing((status) => {
      console.log('Processing status:', status);
    });

    return () => {
      documentListener.remove();
      processingListener.remove();
    };
  }, [sdk, checkBiometricAvailability]);

  const showError = (message: string) => Alert.alert('QuickVerify', message);

  const handleFullVerification = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sdk.performVerification();
      setResultPayload({ mode: 'verification', verificationResult: result });
      setScreen('results');

      if (!result.success) {
        showError(result.error || 'Verification failed');
      }
    } catch (error: any) {
      showError(error.message || 'Unable to complete verification');
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const handleBiometricAuth = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sdk.authenticateWithBiometric('Verify your identity to continue');
      setResultPayload({ mode: 'biometric', biometricResult: result });
      setScreen('results');

      if (!result.success) {
        showError(result.error || 'Authentication failed');
      }
    } catch (error: any) {
      showError(error.message || 'Unable to run biometric authentication');
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const handleDocumentCapture = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sdk.captureDocument();
      setResultPayload({ mode: 'document', documentResult: result });
      setScreen('results');

      if (!result.success) {
        showError(result.error || 'Document capture failed');
      }
    } catch (error: any) {
      showError(error.message || 'Unable to open camera');
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const resetDemo = () => {
    setResultPayload(null);
    setScreen('home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {screen === 'home' && (
        <HomeScreen
          biometricAvailable={biometricAvailable}
          onStart={() => setScreen('verification')}
        />
      )}

      {screen === 'verification' && (
        <VerificationScreen
          biometricAvailable={biometricAvailable}
          loading={loading}
          onFullVerification={handleFullVerification}
          onBiometricOnly={handleBiometricAuth}
          onDocumentOnly={handleDocumentCapture}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'results' && resultPayload && (
        <ResultScreen
          mode={resultPayload.mode}
          verificationResult={resultPayload.verificationResult}
          biometricResult={resultPayload.biometricResult}
          documentResult={resultPayload.documentResult}
          onBackToFlow={() => setScreen('verification')}
          onRestart={resetDemo}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});

export default App;
