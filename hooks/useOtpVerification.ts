import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/auth';
import { formatPhoneNumber, handleFirebaseError, sendOTP } from '@/services/firebaseAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

const VERIFY_OTP_TIME = 30; // 30 seconds

interface UseOtpVerificationProps {
  phoneNumber: string;
  mode?: string;
  fullName?: string;
  role?: string;
}

export const useOtpVerification = ({ phoneNumber, mode = "login", fullName = "", role = "CUSTOMER" }: UseOtpVerificationProps) => {
  const { setUser } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ verificationId?: string }>();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(VERIFY_OTP_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [verificationId, setVerificationId] = useState(params.verificationId || "");

  // Timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Resend OTP via Firebase
      const firebasePhone = formatPhoneNumber(phoneNumber);
      const confirmation = await sendOTP(firebasePhone);
      
      // Update verification ID
      setVerificationId(confirmation.verificationId || "");
      
      // Reset timer
      setTimeLeft(VERIFY_OTP_TIME);
      setIsTimerRunning(true);
    } catch (err) {
      const error = handleFirebaseError(err);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập mã OTP đầy đủ (6 chữ số)");
      return;
    }

    if (!verificationId) {
      setError("Lỗi xác thực. Vui lòng gửi lại OTP");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Verify OTP with Firebase only
      const credential = (await import('@react-native-firebase/auth')).default.PhoneAuthProvider.credential(verificationId, otp);
      const firebaseResult = await (await import('@react-native-firebase/auth')).default().signInWithCredential(credential);
      const user = (await import('@react-native-firebase/auth')).default().currentUser;
      const idToken = user ? await user.getIdToken() : null;
      if (!idToken) throw new Error("Không lấy được Firebase ID token");

      let result;
      if (mode === "register") {
        if (role === "CUSTOMER") {
          await authService.registerCustomer(phoneNumber, fullName);
        } else {
          await authService.registerOwner(phoneNumber, fullName);
        }
        // Immediately log in after registration
        result = await authService.login(phoneNumber);
      } else {
        result = await authService.login(phoneNumber);
      }

      if (result) {
        setUser(result);
        // ... existing profile check and navigation ...
        let shouldRedirectToProfile = false;
        try {
          const userProfile = await authService.getUserProfile(parseInt(result.id));
          const hasFullName = userProfile?.fullName && userProfile.fullName.trim() !== "";
          const hasDob = userProfile?.dob && userProfile.dob !== null && userProfile.dob !== undefined;
          const hasSex = userProfile?.sex && userProfile.sex !== null && userProfile.sex !== undefined;
          if (!hasFullName || !hasDob || !hasSex) {
            shouldRedirectToProfile = true;
          }
        } catch (profileError) {
          shouldRedirectToProfile = true;
        }
        setTimeout(() => {
          if (shouldRedirectToProfile) {
            router.replace("/(auth)/user-information");
          } else {
            router.replace("/(tabs)");
          }
        }, 100);
      }
    } catch (err) {
      const error = handleFirebaseError(err);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    otp,
    setOtp,
    isLoading,
    error,
    timeLeft,
    isTimerRunning,
    formatTime,
    handleResendOtp,
    handleVerifyOtp,
  };
}; 