import * as sdkLib from '../lib';

describe('lib entry', () => {
  it('exports expected members', () => {
    expect(typeof sdkLib.QuickVerifySDK).toBe('function');
    expect(typeof sdkLib.initialize).toBe('function');
    expect(typeof sdkLib.isBiometricAvailable).toBe('function');
    expect(typeof sdkLib.authenticateWithBiometric).toBe('function');
    expect(typeof sdkLib.captureDocument).toBe('function');
    expect(typeof sdkLib.performVerification).toBe('function');
  });
});
