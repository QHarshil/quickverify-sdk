import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { QuickVerifySDK } from '@quickverify/react-native-sdk';
import { HomeScreen } from './screens/HomeScreen';
import { VerificationScreen } from './screens/VerificationScreen';
import { ResultScreen } from './screens/ResultScreen';

const sdk = QuickVerifySDK.getInstance({
  enableFaceID: true,
  captureQuality: 'high',
});

const App = () => {
  const [screen, setScreen] = useState('home');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultPayload, setResultPayload] = useState(null);

  useEffect(() => {
    sdk.isBiometricAvailable().then(setBiometricAvailable);

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
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const avail = await sdk.isBiometricAvailable();
      Alert.alert('Biometric availability', avail ? 'Available' : 'Unavailable');
      setBiometricAvailable(avail);
    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to check biometric availability');
    }
  };

  const showError = (message) => Alert.alert('QuickVerify', message);

  const handleFullVerification = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sdk.performVerification();
      setResultPayload({ mode: 'verification', verificationResult: result });
      setScreen('results');
      if (!result.success) {
        showError(result.error || 'Verification failed');
      }
    } catch (error) {
      showError(error.message || 'Unable to complete verification');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBiometricAuth = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sdk.authenticateWithBiometric('Verify your identity to continue');
      setResultPayload({ mode: 'biometric', biometricResult: result });
      setScreen('results');
      if (!result.success) {
        showError(result.error || 'Authentication failed');
      }
    } catch (error) {
      showError(error.message || 'Unable to run biometric authentication');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDocumentCapture = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sdk.captureDocument();
      setResultPayload({ mode: 'document', documentResult: result });
      setScreen('results');
      if (!result.success) {
        showError(result.error || 'Document capture failed');
      }
    } catch (error) {
      showError(error.message || 'Unable to open camera');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetDemo = () => {
    setResultPayload(null);
    setScreen('home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {screen === 'home' && (
          <HomeScreen
            biometricAvailable={biometricAvailable}
            onStart={() => setScreen('verification')}
            onCheckBiometric={checkBiometricAvailability}
            onTestBiometric={handleBiometricAuth}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
});

export default App;
