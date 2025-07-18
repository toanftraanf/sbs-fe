import auth from '@react-native-firebase/auth';

export async function testFirebaseInitialization() {
  try {
    console.log('🔍 Testing Firebase initialization...');
    
    // Check if Firebase auth is available
    if (!auth) {
      throw new Error('Firebase auth is not available');
    }
    
    console.log('✅ Firebase auth is available');
    
    // Check if we can access Firebase auth methods
    const currentUser = auth().currentUser;
    console.log('✅ Firebase auth methods are accessible');
    console.log('📱 Current user:', currentUser ? 'Logged in' : 'Not logged in');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization test failed:', error);
    return false;
  }
}

export async function testFirebaseSmsCapability() {
  try {
    console.log('🔍 Testing Firebase SMS capability...');
    
    // Check if PhoneAuthProvider is available
    if (!auth.PhoneAuthProvider) {
      throw new Error('PhoneAuthProvider is not available');
    }
    
    console.log('✅ PhoneAuthProvider is available');
    
    // Check if signInWithPhoneNumber method exists
    if (typeof auth().signInWithPhoneNumber !== 'function') {
      throw new Error('signInWithPhoneNumber method is not available');
    }
    
    console.log('✅ signInWithPhoneNumber method is available');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase SMS capability test failed:', error);
    return false;
  }
}

export function logFirebaseConfiguration() {
  console.log('🔧 Firebase Configuration Check:');
  console.log('- Firebase Auth Package:', '@react-native-firebase/auth');
  console.log('- Auth Instance:', !!auth);
  console.log('- PhoneAuthProvider:', !!auth.PhoneAuthProvider);
  console.log('- signInWithPhoneNumber:', typeof auth().signInWithPhoneNumber);
  console.log('- signInWithCredential:', typeof auth().signInWithCredential);
} 