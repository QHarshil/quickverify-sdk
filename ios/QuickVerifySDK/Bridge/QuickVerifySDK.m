#import "QuickVerifySDK.h"
#import "quickverify_sdk-Swift.h"

@implementation QuickVerifySDK

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"onDocumentDetected", @"onProcessing"];
}

RCT_EXPORT_METHOD(isBiometricAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [QuickVerifyBiometricManager isBiometricAvailableWithCompletion:^(BOOL available) {
        resolve(@(available));
    }];
}

RCT_EXPORT_METHOD(authenticateWithBiometric:(NSString *)reason
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [QuickVerifyBiometricManager authenticateWithReason:reason completion:^(BOOL success, NSString * _Nullable biometryType, NSError * _Nullable error) {
        if (success) {
            resolve(@{
                @"success": @YES,
                @"biometryType": biometryType ?: @"none"
            });
        } else {
            resolve(@{
                @"success": @NO,
                @"error": error.localizedDescription ?: @"Authentication failed"
            });
        }
    }];
}

RCT_EXPORT_METHOD(captureDocument:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
        
        [QuickVerifyDocumentCapture presentCaptureFrom:rootViewController
                                                config:config
                                            completion:^(BOOL success, NSString * _Nullable imageUri, NSArray * _Nullable corners, NSError * _Nullable error) {
            if (success) {
                NSMutableDictionary *result = [NSMutableDictionary dictionary];
                result[@"success"] = @YES;
                if (imageUri) {
                    result[@"imageUri"] = imageUri;
                }
                if (corners) {
                    result[@"corners"] = corners;
                }
                resolve(result);
            } else {
                resolve(@{
                    @"success": @NO,
                    @"error": error.localizedDescription ?: @"Document capture failed"
                });
            }
        } eventHandler:^(NSString * _Nonnull eventName, id  _Nullable data) {
            [self sendEventWithName:eventName body:data];
        }];
    });
}

@end
