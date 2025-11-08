import Foundation

@objc(VerificationResult)
public class VerificationResult: NSObject {
    
    @objc public let success: Bool
    @objc public let biometricVerified: Bool
    @objc public let documentCaptured: Bool
    @objc public let documentImageUri: String?
    @objc public let error: String?
    @objc public let timestamp: Date
    
    @objc public init(
        success: Bool,
        biometricVerified: Bool,
        documentCaptured: Bool,
        documentImageUri: String? = nil,
        error: String? = nil
    ) {
        self.success = success
        self.biometricVerified = biometricVerified
        self.documentCaptured = documentCaptured
        self.documentImageUri = documentImageUri
        self.error = error
        self.timestamp = Date()
        super.init()
    }
    
    @objc public func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "success": success,
            "biometricVerified": biometricVerified,
            "documentCaptured": documentCaptured,
            "timestamp": timestamp.timeIntervalSince1970
        ]
        
        if let imageUri = documentImageUri {
            dict["documentImageUri"] = imageUri
        }
        
        if let errorMsg = error {
            dict["error"] = errorMsg
        }
        
        return dict
    }
}

