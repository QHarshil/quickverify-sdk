import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BiometricResult, DocumentCaptureResult, VerificationResult } from '@quickverify/react-native-sdk';

export type ResultMode = 'verification' | 'biometric' | 'document';

interface ResultScreenProps {
  mode: ResultMode;
  verificationResult?: VerificationResult | null;
  biometricResult?: BiometricResult | null;
  documentResult?: DocumentCaptureResult | null;
  onRestart: () => void;
  onBackToFlow: () => void;
}

export function ResultScreen({
  mode,
  verificationResult,
  biometricResult,
  documentResult,
  onRestart,
  onBackToFlow,
}: ResultScreenProps) {
  const header = {
    verification: 'Full Verification',
    biometric: 'Biometric Authentication',
    document: 'Document Capture',
  }[mode];

  const currentStatus =
    (mode === 'verification' && verificationResult?.success) ||
    (mode === 'biometric' && biometricResult?.success) ||
    (mode === 'document' && documentResult?.success)
      ? 'Success'
      : 'Needs Attention';

  const statusStyle = currentStatus === 'Success' ? styles.success : styles.error;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{header}</Text>
      <Text style={[styles.status, statusStyle]}>{currentStatus}</Text>

      {mode === 'verification' && verificationResult && (
        <View style={styles.card}>
          <Row label="Biometric" value={verificationResult.biometricVerified ? 'Verified' : 'Failed'} />
          <Row label="Document" value={verificationResult.documentCaptured ? 'Captured' : 'Missing'} />
          {verificationResult.documentImageUri && (
            <Row label="Image URI" value={verificationResult.documentImageUri} />
          )}
          {verificationResult.error && <Row label="Error" value={verificationResult.error} />}
        </View>
      )}

      {mode === 'biometric' && biometricResult && (
        <View style={styles.card}>
          <Row label="Status" value={biometricResult.success ? 'Authenticated' : 'Failed'} />
          <Row label="Biometry" value={biometricResult.biometryType ?? 'unknown'} />
          {biometricResult.error && <Row label="Error" value={biometricResult.error} />} 
        </View>
      )}

      {mode === 'document' && documentResult && (
        <View style={styles.card}>
          <Row label="Status" value={documentResult.success ? 'Captured' : 'Failed'} />
          {documentResult.imageUri && <Row label="Image URI" value={documentResult.imageUri} />}
          {documentResult.error && <Row label="Error" value={documentResult.error} />}
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={onBackToFlow}>
        <Text style={styles.primaryButtonText}>Back to Actions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onRestart}>
        <Text style={styles.secondaryButtonText}>Restart Demo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0f172a',
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  success: {
    color: '#0f9d58',
  },
  error: {
    color: '#d93025',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 16,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#1d4ed8',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
