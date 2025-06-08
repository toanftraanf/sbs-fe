import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

const VERIFY_OTP_TIME = 30; // 30 seconds

interface UseOtpVerificationProps {
  phoneNumber: string;
}

export const useOtpVerification = ({ phoneNumber }: UseOtpVerificationProps) => {
  const { setUser } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(VERIFY_OTP_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

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

      const success = await authService.resetOTP(phoneNumber);
      if (success) {
        setTimeLeft(VERIFY_OTP_TIME);
        setIsTimerRunning(true);
      } else {
        setError("Không thể gửi lại OTP. Vui lòng thử lại.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi mạng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    // if (!otp || otp.length !== 6) {
    //   setError("Vui lòng nhập mã OTP đầy đủ (6 chữ số)");
    //   return;
    // }
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.login(phoneNumber, otp);
      console.log("Login result:", result);
      
      if (result) {
        setUser(result);

        let shouldRedirectToProfile = false;

        // Check if user needs to complete their profile
        try {
          const userProfile = await authService.getUserProfile(parseInt(result.id));
          
          // Check if user has essential profile information
          const hasFullName = userProfile?.fullName && userProfile.fullName.trim() !== "";
          const hasDob = userProfile?.dob && userProfile.dob !== null && userProfile.dob !== undefined;
          const hasSex = userProfile?.sex && userProfile.sex !== null && userProfile.sex !== undefined;
          
          console.log("Profile check details:", {
            hasFullName,
            hasDob,
            hasSex,
            fullName: userProfile?.fullName,
            dob: userProfile?.dob,
            sex: userProfile?.sex,
            userProfileExists: !!userProfile
          });
          
          if (!hasFullName || !hasDob || !hasSex) {
            shouldRedirectToProfile = true;
          }
        } catch (profileError) {
          console.log("❌ Error fetching user profile, assuming incomplete:", profileError);
          shouldRedirectToProfile = true;
        }

        // Navigate based on profile completion
        setTimeout(() => {
          if (shouldRedirectToProfile) {
            router.replace("/(auth)/user-information-step1");
          } else {
            // User has complete profile, navigate to appropriate tab
            if (result.role === "OWNER") {
              router.replace("/(tabs)/stadium-status");
            } else {
              router.replace("/(tabs)");
            }
          }
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác thực thất bại");
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