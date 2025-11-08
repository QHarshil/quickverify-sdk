import { QuickVerifySDK } from '../src';

const nativeModule = require('react-native').NativeModules.QuickVerifySDK;

describe('QuickVerifySDK', () => {
  beforeEach(() => {
    QuickVerifySDK['instance'] = undefined as unknown as QuickVerifySDK; // reset singleton
  });

  it('creates singleton instance with default config', () => {
    const sdk = QuickVerifySDK.getInstance();
    expect(sdk.getConfig()).toMatchObject({
      enableFaceID: true,
      captureQuality: 'high',
      timeout: 30000,
    });
  });

  it('updates configuration via updateConfig', () => {
    const sdk = QuickVerifySDK.getInstance({ enableFaceID: false });
    sdk.updateConfig({ timeout: 1000 });
    expect(sdk.getConfig()).toMatchObject({ enableFaceID: false, timeout: 1000 });
  });

  it('invokes native biometric availability check', async () => {
    const sdk = QuickVerifySDK.getInstance();
    await sdk.isBiometricAvailable();
    expect(nativeModule.isBiometricAvailable).toHaveBeenCalled();
  });

  it('runs performVerification happy path', async () => {
    const sdk = QuickVerifySDK.getInstance();
    const result = await sdk.performVerification();
    expect(result.success).toBe(true);
    expect(nativeModule.authenticateWithBiometric).toHaveBeenCalled();
    expect(nativeModule.captureDocument).toHaveBeenCalled();
  });

  it('surfaces biometric failure', async () => {
    nativeModule.authenticateWithBiometric.mockResolvedValueOnce({
      success: false,
      error: 'User canceled',
    });
    const sdk = QuickVerifySDK.getInstance();
    const result = await sdk.performVerification();
    expect(result.success).toBe(false);
    expect(result.error).toBe('User canceled');
  });
});
