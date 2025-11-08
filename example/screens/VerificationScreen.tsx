import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

interface VerificationScreenProps {
  biometricAvailable: boolean;
  loading: boolean;
  onFullVerification: () => void;
  onBiometricOnly: () => void;
  onDocumentOnly: () => void;
  onBack: () => void;
}

export function VerificationScreen({
  biometricAvailable,
  loading,
  onFullVerification,
  onBiometricOnly,
  onDocumentOnly,
  onBack,
}: VerificationScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Verification Flow</Text>
      <Text style={styles.description}>
        Trigger the SDK in different modes. Each action routes to the results screen so you can
        inspect the payload and captured metadata.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Biometric Support</Text>
          <Text style={[styles.statusValue, biometricAvailable ? styles.success : styles.error]}>
            {biometricAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
        onPress={onFullVerification}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonEmoji}>🔐</Text>
            <Text style={styles.buttonText}>Full Verification</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, biometricAvailable ? styles.secondaryButton : styles.disabledButton]}
        onPress={onBiometricOnly}
        disabled={!biometricAvailable || loading}
      >
        <Text style={styles.buttonEmoji}>👤</Text>
        <Text style={[styles.buttonText, biometricAvailable ? styles.secondaryText : styles.disabledText]}>
          Biometric Only
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={onDocumentOnly}
        disabled={loading}
      >
        <Text style={styles.buttonEmoji}>📄</Text>
        <Text style={[styles.buttonText, styles.secondaryText]}>Capture Document</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={onBack}>
        <Text style={styles.linkText}>Back to Overview</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  description: {
    color: '#475569',
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 16,
    color: '#374151',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  success: {
    color: '#15803d',
  },
  error: {
    color: '#b91c1c',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#1d4ed8',
    backgroundColor: '#fff',
  },
  buttonEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#1d4ed8',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#94a3b8',
  },
  linkButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  linkText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
