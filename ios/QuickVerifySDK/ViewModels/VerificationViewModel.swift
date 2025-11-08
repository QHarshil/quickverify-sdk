import Foundation
import Combine

@objc(VerificationViewModel)
public class VerificationViewModel: ObservableObject {
    
    @Published var isProcessing: Bool = false
    @Published var verificationState: VerificationState = .idle
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    
    public enum VerificationState {
        case idle
        case authenticating
        case capturingDocument
        case processing
        case completed
        case failed
    }
    
    public init() {}
    
    public func startVerification() {
        verificationState = .authenticating
        isProcessing = true
    }
    
    public func documentCaptured() {
        verificationState = .processing
    }
    
    public func completeVerification() {
        verificationState = .completed
        isProcessing = false
    }
    
    public func failVerification(error: String) {
        verificationState = .failed
        errorMessage = error
        isProcessing = false
    }
    
    public func reset() {
        verificationState = .idle
        isProcessing = false
        errorMessage = nil
    }
}

