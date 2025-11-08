import Foundation
import LocalAuthentication

@objc(QuickVerifyBiometricManager)
public class QuickVerifyBiometricManager: NSObject {
    
    @objc public static func isBiometricAvailable(completion: @escaping (Bool) -> Void) {
        let context = LAContext()
        var error: NSError?
        
        let canEvaluate = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        completion(canEvaluate)
    }
    
    @objc public static func authenticate(
        reason: String,
        completion: @escaping (Bool, String?, Error?) -> Void
    ) {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            completion(false, nil, error)
            return
        }
        
        let biometryType: String
        switch context.biometryType {
        case .faceID:
            biometryType = "faceID"
        case .touchID:
            biometryType = "touchID"
        default:
            biometryType = "none"
        }
        
        context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        ) { success, authError in
            DispatchQueue.main.async {
                completion(success, biometryType, authError)
            }
        }
    }
}

