package com.quickverify

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

class QuickverifyBiometricActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        launchPrompt()
    }

    private fun launchPrompt() {
        val reason = intent.getStringExtra(EXTRA_REASON) ?: "Verify your identity"
        val executor = ContextCompat.getMainExecutor(this)
        val biometricPrompt = BiometricPrompt(this, executor, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                finishWithResult(true, biometryType = detectBiometryType())
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                finishWithResult(false, error = errString.toString())
            }

            override fun onAuthenticationFailed() {
                // Let the system prompt continue until user succeeds/cancels
            }
        })

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(reason)
            .setSubtitle("QuickVerify")
            .setNegativeButtonText("Cancel")
            .build()

        biometricPrompt.authenticate(promptInfo)
    }

    private fun detectBiometryType(): String {
        val pm = packageManager
        return when {
            pm.hasSystemFeature(PackageManager.FEATURE_FACE) -> "faceID"
            pm.hasSystemFeature(PackageManager.FEATURE_FINGERPRINT) -> "touchID"
            else -> "none"
        }
    }

    private fun finishWithResult(success: Boolean, biometryType: String? = null, error: String? = null) {
        val data = Intent().apply {
            putExtra(EXTRA_SUCCESS, success)
            putExtra(EXTRA_BIOMETRY_TYPE, biometryType)
            putExtra(EXTRA_ERROR, error)
        }
        setResult(if (success) Activity.RESULT_OK else Activity.RESULT_CANCELED, data)
        finish()
    }

    companion object {
        const val EXTRA_REASON = "quickverify_reason"
        const val EXTRA_SUCCESS = "quickverify_success"
        const val EXTRA_ERROR = "quickverify_error"
        const val EXTRA_BIOMETRY_TYPE = "quickverify_biometry_type"

        fun intent(context: Context, reason: String?): Intent =
            Intent(context, QuickverifyBiometricActivity::class.java).apply {
                putExtra(EXTRA_REASON, reason)
            }
    }
}
