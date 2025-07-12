import auth from '@react-native-firebase/auth';

export async function debugFirebaseSms(phoneNumber: string) {
  const debugLog: string[] = [];
  
  try {
    debugLog.push('🔍 Starting Firebase SMS debug...');
    debugLog.push(`📱 Phone number: ${phoneNumber}`);
    
    // Check if Firebase auth is available
    if (!auth) {
      debugLog.push('❌ Firebase auth is not available');
      return debugLog;
    }
    debugLog.push('✅ Firebase auth is available');
    
    // Check if PhoneAuthProvider is available
    if (!auth.PhoneAuthProvider) {
      debugLog.push('❌ PhoneAuthProvider is not available');
      return debugLog;
    }
    debugLog.push('✅ PhoneAuthProvider is available');
    
    // Check if signInWithPhoneNumber method exists
    if (typeof auth().signInWithPhoneNumber !== 'function') {
      debugLog.push('❌ signInWithPhoneNumber method is not available');
      return debugLog;
    }
    debugLog.push('✅ signInWithPhoneNumber method is available');
    
    // Try to send OTP
    debugLog.push('📤 Attempting to send OTP...');
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    
    debugLog.push('✅ OTP sent successfully!');
    debugLog.push(`🔑 VerificationId: ${confirmation.verificationId}`);
    
    return debugLog;
  } catch (error: any) {
    debugLog.push(`❌ Error occurred: ${error.message}`);
    debugLog.push(`🔍 Error code: ${error.code}`);
    debugLog.push(`📋 Error details: ${JSON.stringify(error)}`);
    
    // Common error codes and solutions
    switch (error.code) {
      case 'auth/invalid-phone-number':
        debugLog.push('💡 Solution: Check phone number format (should be +84xxxxxxxxx)');
        break;
      case 'auth/too-many-requests':
        debugLog.push('💡 Solution: Wait 1-2 minutes before trying again');
        break;
      case 'auth/quota-exceeded':
        debugLog.push('💡 Solution: Check Firebase billing/usage limits');
        break;
      case 'auth/network-request-failed':
        debugLog.push('💡 Solution: Check internet connection');
        break;
      default:
        debugLog.push('💡 Solution: Check Firebase Console settings');
    }
    
    return debugLog;
  }
}

export function getFirebaseConfigurationInfo() {
  const info: string[] = [];
  
  info.push('🔧 Firebase Configuration Check:');
  info.push(`- Firebase Auth Package: @react-native-firebase/auth`);
  info.push(`- Auth Instance: ${!!auth}`);
  info.push(`- PhoneAuthProvider: ${!!auth.PhoneAuthProvider}`);
  info.push(`- signInWithPhoneNumber: ${typeof auth().signInWithPhoneNumber}`);
  info.push(`- signInWithCredential: ${typeof auth().signInWithCredential}`);
  
  // Check if we're in development mode
  if (__DEV__) {
    info.push('- Environment: Development');
  } else {
    info.push('- Environment: Production');
  }
  
  return info;
} 