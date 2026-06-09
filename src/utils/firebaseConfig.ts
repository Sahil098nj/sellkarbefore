// Firebase is configured via the native google-services.json (Android) and
// GoogleService-Info.plist (iOS) files. The @react-native-firebase SDK reads
// those files automatically — no JS config object is needed here.
//
// This file exports the auth instance for use across the app.

import auth from '@react-native-firebase/auth';

// Keep app verification enabled so debug builds request real Firebase SMS OTPs.
auth().settings.appVerificationDisabledForTesting = false;

export const firebaseAuth = auth;

export const initializeFirebaseMessaging = async () => {
  try {
    // Firebase messaging handlers can be configured here if needed.
  } catch (error) {
    console.error('Firebase messaging initialization failed:', error);
  }
};
