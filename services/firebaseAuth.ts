import auth from '@react-native-firebase/auth';

// Send OTP using Firebase
async function sendOTP(phoneNumber: string) {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Verify OTP with Firebase and notify backend
async function verifyOTPAndNotifyBackend(verificationId: string, code: string, phoneNumber: string, backendUrl: string) {
  try {
    // 1. Verify OTP with Firebase first
    const credential = auth.PhoneAuthProvider.credential(verificationId, code);
    const firebaseResult = await auth().signInWithCredential(credential);
    
    console.log("Firebase OTP verified successfully:", firebaseResult.user.uid);

    // 2. Notify backend that Firebase verification was successful
    const response = await fetch(`${backendUrl}/api/firebase-verified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        firebaseUid: firebaseResult.user.uid,
        verified: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to notify backend');
    }

    return firebaseResult;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Format phone number to international format
function formatPhoneNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (digits.startsWith('0')) {
    return '+84' + digits.substring(1);
  }
  
  if (!digits.startsWith('84')) {
    return '+84' + digits;
  }
  
  if (!phoneNumber.startsWith('+')) {
    return '+' + digits;
  }
  
  return phoneNumber;
}

// Handle Firebase errors
function handleFirebaseError(error: any): Error {
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-phone-number':
        return new Error('Số điện thoại không hợp lệ');
      case 'auth/too-many-requests':
        return new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau');
      case 'auth/invalid-verification-code':
        return new Error('Mã OTP không đúng');
      case 'auth/code-expired':
        return new Error('Mã OTP đã hết hạn');
      case 'auth/missing-verification-code':
        return new Error('Vui lòng nhập mã OTP');
      case 'auth/missing-verification-id':
        return new Error('Lỗi xác thực. Vui lòng thử lại');
      case 'auth/network-request-failed':
        return new Error('Lỗi mạng. Vui lòng kiểm tra kết nối');
      default:
        return new Error(error.message || 'Có lỗi xảy ra trong quá trình xác thực');
    }
  }
  
  return new Error(error.message || 'Có lỗi xảy ra');
}

export { formatPhoneNumber, handleFirebaseError, sendOTP, verifyOTPAndNotifyBackend };

