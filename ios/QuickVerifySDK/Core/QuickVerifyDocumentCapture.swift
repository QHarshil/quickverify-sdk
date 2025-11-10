import Foundation
import UIKit
import AVFoundation
import Vision

public typealias CaptureCompletion = (Bool, String?, [[String: CGFloat]]?, Error?) -> Void
public typealias EventHandler = (String, Any?) -> Void

@objc(QuickVerifyDocumentCapture)
public class QuickVerifyDocumentCapture: NSObject {
    
    @objc public static func presentCapture(
        from viewController: UIViewController,
        config: [String: Any],
        completion: @escaping CaptureCompletion,
        eventHandler: @escaping EventHandler
    ) {
        let captureVC = DocumentCaptureViewController()
        captureVC.config = config
        captureVC.completion = completion
        captureVC.eventHandler = eventHandler
        captureVC.modalPresentationStyle = .fullScreen
        
        viewController.present(captureVC, animated: true)
    }
}

class DocumentCaptureViewController: UIViewController {
    
    var config: [String: Any] = [:]
    var completion: CaptureCompletion?
    var eventHandler: EventHandler?
    
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var videoOutput: AVCaptureVideoDataOutput?
    private let photoOutput = AVCapturePhotoOutput()
    
    private var documentDetected = false
    private var detectedCorners: [[String: CGFloat]]?
    
    private let overlayView = DocumentOverlayView()
    private let captureButton = UIButton(type: .system)
    private let processingView = ProcessingView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .black
        setupCamera()
        setupUI()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startCapture()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        stopCapture()
    }
    
    private func setupCamera() {
        captureSession = AVCaptureSession()
        captureSession?.sessionPreset = .photo
        
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: device),
              let session = captureSession else {
            return
        }
        
        if session.canAddInput(input) {
            session.addInput(input)
        }
        
        videoOutput = AVCaptureVideoDataOutput()
        videoOutput?.setSampleBufferDelegate(self, queue: DispatchQueue(label: "videoQueue"))
        
        if let output = videoOutput, session.canAddOutput(output) {
            session.addOutput(output)
        }
        
        if session.canAddOutput(photoOutput) {
            session.addOutput(photoOutput)
            photoOutput.isHighResolutionCaptureEnabled = true
        }
        
        previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer?.videoGravity = .resizeAspectFill
        previewLayer?.frame = view.bounds
        
        if let layer = previewLayer {
            view.layer.addSublayer(layer)
        }
    }
    
    private func setupUI() {
        // Overlay view
        overlayView.frame = view.bounds
        overlayView.backgroundColor = .clear
        view.addSubview(overlayView)
        
        // Capture button
        captureButton.setTitle("Capture", for: .normal)
        captureButton.titleLabel?.font = .systemFont(ofSize: 18, weight: .semibold)
        captureButton.backgroundColor = .systemBlue
        captureButton.tintColor = .white
        captureButton.layer.cornerRadius = 30
        captureButton.translatesAutoresizingMaskIntoConstraints = false
        captureButton.addTarget(self, action: #selector(captureButtonTapped), for: .touchUpInside)
        view.addSubview(captureButton)
        
        NSLayoutConstraint.activate([
            captureButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            captureButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -30),
            captureButton.widthAnchor.constraint(equalToConstant: 200),
            captureButton.heightAnchor.constraint(equalToConstant: 60)
        ])
        
        // Processing view
        processingView.frame = view.bounds
        processingView.isHidden = true
        view.addSubview(processingView)
        
        // Close button
        let closeButton = UIButton(type: .system)
        closeButton.setTitle("✕", for: .normal)
        closeButton.titleLabel?.font = .systemFont(ofSize: 24, weight: .medium)
        closeButton.tintColor = .white
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        closeButton.addTarget(self, action: #selector(closeButtonTapped), for: .touchUpInside)
        view.addSubview(closeButton)
        
        NSLayoutConstraint.activate([
            closeButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            closeButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            closeButton.widthAnchor.constraint(equalToConstant: 44),
            closeButton.heightAnchor.constraint(equalToConstant: 44)
        ])
    }
    
    private func startCapture() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession?.startRunning()
        }
    }
    
    private func stopCapture() {
        captureSession?.stopRunning()
    }
    
    @objc private func captureButtonTapped() {
        guard documentDetected else {
            showAlert(message: "Please position the document within the frame")
            return
        }
        
        captureImage()
    }
    
    @objc private func closeButtonTapped() {
        dismiss(animated: true) { [weak self] in
            self?.completion?(false, nil, nil, NSError(domain: "QuickVerify", code: -1, userInfo: [NSLocalizedDescriptionKey: "Capture cancelled"]))
        }
    }
    
    private func captureImage() {
        processingView.isHidden = false
        processingView.startAnimating()
        eventHandler?("onProcessing", ["status": "processing"])
        
        let settings = AVCapturePhotoSettings()
        settings.isHighResolutionPhotoEnabled = true
        settings.flashMode = .off
        
        photoOutput.capturePhoto(with: settings, delegate: self)
    }
    
    private func saveImage(data: Data) throws -> String {
        let documentsPath = NSTemporaryDirectory()
        let filename = "captured_document_\(UUID().uuidString).jpg"
        let url = URL(fileURLWithPath: documentsPath).appendingPathComponent(filename)
        try data.write(to: url, options: .atomic)
        return url.absoluteString
    }
    
    private func showAlert(message: String) {
        let alert = UIAlertController(title: "Document Capture", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func finishCapture(success: Bool, imageUri: String? = nil, error: Error? = nil) {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.stopCapture()
            self.processingView.stopAnimating()
            self.dismiss(animated: true) {
                if success {
                    self.completion?(true, imageUri, self.detectedCorners, nil)
                } else {
                    let nsError = error ?? NSError(domain: "QuickVerify", code: -2, userInfo: [NSLocalizedDescriptionKey: "Document capture failed"])
                    self.completion?(false, nil, nil, nsError)
                }
            }
        }
    }
}

// MARK: - AVCaptureVideoDataOutputSampleBufferDelegate
extension DocumentCaptureViewController: AVCaptureVideoDataOutputSampleBufferDelegate {
    
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
            return
        }
        
        detectDocument(in: pixelBuffer)
    }
    
    private func detectDocument(in pixelBuffer: CVPixelBuffer) {
        let request = VNDetectRectanglesRequest { [weak self] request, error in
            guard let self = self,
                  let results = request.results as? [VNRectangleObservation],
                  let rect = results.first else {
                DispatchQueue.main.async {
                    self?.documentDetected = false
                    self?.overlayView.updateCorners(nil)
                }
                return
            }
            
            // Convert normalized coordinates to view coordinates
            let corners = [
                ["x": rect.topLeft.x, "y": rect.topLeft.y],
                ["x": rect.topRight.x, "y": rect.topRight.y],
                ["x": rect.bottomRight.x, "y": rect.bottomRight.y],
                ["x": rect.bottomLeft.x, "y": rect.bottomLeft.y]
            ]
            
            DispatchQueue.main.async {
                self.documentDetected = true
                self.detectedCorners = corners
                self.overlayView.updateCorners(corners)
                self.eventHandler?("onDocumentDetected", ["corners": corners])
            }
        }
        
        request.minimumAspectRatio = 0.3
        request.maximumAspectRatio = 1.0
        request.minimumSize = 0.3
        request.maximumObservations = 1
        
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, options: [:])
        try? handler.perform([request])
    }
}

// MARK: - AVCapturePhotoCaptureDelegate
extension DocumentCaptureViewController: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error {
            finishCapture(success: false, error: error)
            return
        }
        
        guard let data = photo.fileDataRepresentation() else {
            finishCapture(success: false, error: NSError(domain: "QuickVerify", code: -3, userInfo: [NSLocalizedDescriptionKey: "Unable to read captured photo"]))
            return
        }
        
        do {
            let imageUri = try saveImage(data: data)
            finishCapture(success: true, imageUri: imageUri)
        } catch {
            finishCapture(success: false, error: error)
        }
    }
}

// MARK: - DocumentOverlayView
class DocumentOverlayView: UIView {
    
    private let shapeLayer = CAShapeLayer()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }
    
    private func setup() {
        shapeLayer.strokeColor = UIColor.systemGreen.cgColor
        shapeLayer.lineWidth = 3
        shapeLayer.fillColor = UIColor.clear.cgColor
        layer.addSublayer(shapeLayer)
    }
    
    func updateCorners(_ corners: [[String: CGFloat]]?) {
        guard let corners = corners else {
            shapeLayer.path = nil
            return
        }
        
        let path = UIBezierPath()
        
        for (index, corner) in corners.enumerated() {
            let x = (corner["x"] ?? 0) * bounds.width
            let y = (1 - (corner["y"] ?? 0)) * bounds.height
            let point = CGPoint(x: x, y: y)
            
            if index == 0 {
                path.move(to: point)
            } else {
                path.addLine(to: point)
            }
        }
        
        path.close()
        shapeLayer.path = path.cgPath
    }
}

// MARK: - ProcessingView
class ProcessingView: UIView {
    
    private let activityIndicator = UIActivityIndicatorView(style: .large)
    private let label = UILabel()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }
    
    private func setup() {
        backgroundColor = UIColor.black.withAlphaComponent(0.8)
        
        activityIndicator.color = .white
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        addSubview(activityIndicator)
        
        label.text = "Processing document..."
        label.textColor = .white
        label.font = .systemFont(ofSize: 18, weight: .medium)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        addSubview(label)
        
        NSLayoutConstraint.activate([
            activityIndicator.centerXAnchor.constraint(equalTo: centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: centerYAnchor, constant: -30),
            
            label.centerXAnchor.constraint(equalTo: centerXAnchor),
            label.topAnchor.constraint(equalTo: activityIndicator.bottomAnchor, constant: 20)
        ])
    }
    
    func startAnimating() {
        activityIndicator.startAnimating()
    }
    
    func stopAnimating() {
        activityIndicator.stopAnimating()
    }
}
