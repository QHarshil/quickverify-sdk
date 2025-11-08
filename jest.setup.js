const listeners = new Map();

jest.mock('react-native', () => {
  const EventEmitter = function () {
    return {
      addListener: (event, handler) => {
        if (!listeners.has(event)) {
          listeners.set(event, new Set());
        }
        listeners.get(event).add(handler);
        return {
          remove: () => listeners.get(event)?.delete(handler),
        };
      },
      removeAllListeners: (event) => listeners.delete(event),
      emit: (event, payload) => listeners.get(event)?.forEach((cb) => cb(payload)),
    };
  };

  return {
    NativeModules: {
      QuickVerifySDK: {
        isBiometricAvailable: jest.fn().mockResolvedValue(true),
        authenticateWithBiometric: jest
          .fn()
          .mockResolvedValue({ success: true, biometryType: 'faceID' }),
        captureDocument: jest
          .fn()
          .mockResolvedValue({ success: true, imageUri: 'file://doc.jpg' }),
      },
    },
    NativeEventEmitter: EventEmitter,
    Platform: {
      OS: 'ios',
      select: (options) => options.ios ?? options.default,
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});
