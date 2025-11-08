package com.quickverify

import android.Manifest
import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.MediaStore
import androidx.biometric.BiometricManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class QuickverifySdkModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var capturePromise: Promise? = null
    private var biometricPromise: Promise? = null
    private var pendingImageUri: Uri? = null

    companion object {
        private const val REQUEST_DOCUMENT_CAPTURE = 0x2510
        private const val REQUEST_BIOMETRIC_PROMPT = 0x2511
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName() = "QuickVerifySDK"

    @ReactMethod
    fun isBiometricAvailable(promise: Promise) {
        val manager = BiometricManager.from(reactContext)
        val canAuthenticate = manager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)
        promise.resolve(canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS)
    }

    @ReactMethod
    fun authenticateWithBiometric(reason: String?, promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("no_activity", "No active activity to present biometric prompt")
            return
        }

        if (biometricPromise != null) {
            promise.reject("biometric_in_progress", "Biometric authentication already running")
            return
        }

        biometricPromise = promise

        try {
            val intent = QuickverifyBiometricActivity.intent(activity, reason)
            activity.startActivityForResult(intent, REQUEST_BIOMETRIC_PROMPT)
        } catch (error: Exception) {
            biometricPromise = null
            promise.reject("biometric_error", error.message, error)
        }
    }

    @ReactMethod
    fun captureDocument(config: ReadableMap?, promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("no_activity", "No active activity to start camera")
            return
        }

        if (capturePromise != null) {
            promise.reject("capture_in_progress", "Document capture already running")
            return
        }

        if (!hasCameraPermission(activity)) {
            promise.reject("camera_permission", "Camera permission is required to capture documents")
            return
        }

        val contentValues = ContentValues().apply {
            put(MediaStore.Images.Media.TITLE, "QuickVerify_${System.currentTimeMillis()}")
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
        }

        val imageUri = activity.contentResolver.insert(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            contentValues
        ) ?: run {
            promise.reject("storage_error", "Unable to create file for captured image")
            return
        }

        pendingImageUri = imageUri
        capturePromise = promise
        emitProcessingStatus("camera_opened")

        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
            putExtra(MediaStore.EXTRA_OUTPUT, imageUri)
            addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

        try {
            activity.startActivityForResult(intent, REQUEST_DOCUMENT_CAPTURE)
        } catch (error: Exception) {
            capturePromise = null
            pendingImageUri = null
            promise.reject("camera_error", error.message, error)
        }
    }

    private fun hasCameraPermission(activity: Activity): Boolean {
        val granted = ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA)
        return granted == PackageManager.PERMISSION_GRANTED
    }

    private fun emitProcessingStatus(status: String) {
        val payload = Arguments.createMap().apply {
            putString("status", status)
        }
        emitEvent("onProcessing", payload)
    }

    private fun emitEvent(name: String, data: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(name, data)
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        when (requestCode) {
            REQUEST_BIOMETRIC_PROMPT -> handleBiometricResult(resultCode, data)
            REQUEST_DOCUMENT_CAPTURE -> handleDocumentResult(resultCode)
        }
    }

    private fun handleBiometricResult(resultCode: Int, data: Intent?) {
        val promise = biometricPromise ?: return
        biometricPromise = null

        if (resultCode == Activity.RESULT_OK && data?.getBooleanExtra(QuickverifyBiometricActivity.EXTRA_SUCCESS, false) == true) {
            val map = Arguments.createMap().apply {
                putBoolean("success", true)
                putString(
                    "biometryType",
                    data.getStringExtra(QuickverifyBiometricActivity.EXTRA_BIOMETRY_TYPE) ?: "none"
                )
            }
            promise.resolve(map)
        } else {
            val map = Arguments.createMap().apply {
                putBoolean("success", false)
                putString(
                    "error",
                    data?.getStringExtra(QuickverifyBiometricActivity.EXTRA_ERROR)
                        ?: "Authentication canceled"
                )
            }
            promise.resolve(map)
        }
    }

    private fun handleDocumentResult(resultCode: Int) {
        val promise = capturePromise ?: return
        val uri = pendingImageUri
        capturePromise = null
        pendingImageUri = null

        if (resultCode == Activity.RESULT_OK && uri != null) {
            emitProcessingStatus("completed")
            val map = Arguments.createMap().apply {
                putBoolean("success", true)
                putString("imageUri", uri.toString())
            }
            promise.resolve(map)
        } else {
            val map = Arguments.createMap().apply {
                putBoolean("success", false)
                putString("error", "Document capture canceled")
            }
            promise.resolve(map)
        }
    }

    override fun onNewIntent(intent: Intent?) = Unit
}
