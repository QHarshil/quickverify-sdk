import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface HomeScreenProps {
  onStart: () => void;
  biometricAvailable: boolean;
}

export function HomeScreen({ onStart, biometricAvailable }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Example App</Text>
      </View>
      <Text style={styles.title}>QuickVerify Playground</Text>
      <Text style={styles.subtitle}>
        Explore the SDK from a guided flow. Run the verification steps, inspect the
        results screen, and jump back to tweak configuration.
      </Text>

      <Image
        source={{ uri: 'https://placehold.co/400x260/1e1e2f/ffffff?text=QuickVerify' }}
        style={styles.heroImage}
      />

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Biometric Ready</Text>
        <Text style={[styles.statusValue, biometricAvailable ? styles.success : styles.error]}>
          {biometricAvailable ? 'Available' : 'Unavailable'}
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onStart}>
        <Text style={styles.primaryButtonText}>Open Verification Flow</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    color: '#0D47A1',
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginTop: 12,
    lineHeight: 22,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginVertical: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  success: {
    color: '#2E7D32',
  },
  error: {
    color: '#C62828',
  },
  primaryButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
