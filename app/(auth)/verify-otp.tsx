import AppOtpInput from "@/components/AppOtpInput";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";
import AppButton from "../../components/AppButton";
import authService from "../../services/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyOtp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const phoneNumber = params.phoneNumber || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const { setUser } = useAuth();

  // useEffect để giảm dần timeLeft mỗi giây khi isTimerRunning = true
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

  // Format timeLeft (sang MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Gửi lại OTP (khi timeLeft = 0)
  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    try {
      setIsLoading(true);
      setError(null);

      // Gọi API resetOTP (GraphQL hoặc REST tuỳ backend)
      const success = await authService.resetOTP(phoneNumber);
      if (success) {
        setTimeLeft(30);
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

  // Xác nhận OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập mã OTP đầy đủ (6 chữ số)");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.login(phoneNumber, otp);
      console.log('User after login:', result);
      if (result) {
        // Lưu thông tin user vào context
        setUser(result);
        // Đợi context cập nhật rồi mới chuyển hướng
        setTimeout(() => {
        if (result.role === 'OWNER') {
            router.replace("/(tabs)/stadium-status");
        } else {
          router.replace("/(tabs)/stadium-booking");
        }
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác thực thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-10">
      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-6"
      >
        <Ionicons name="arrow-back" size={28} color="#515151" />
      </TouchableOpacity>

      {/* Tiêu đề */}
      <Text className="font-InterBold text-2xl text-secondary mb-2">
        XÁC NHẬN OTP
      </Text>
      <Text className="text-secondary mb-6">
        Vui lòng nhập mã OTP đã được{`\n`}gửi qua số {phoneNumber}
      </Text>

      {/* Thông báo lỗi */}
      {error && (
        <Text className="text-red-500 mb-4 text-center">{error}</Text>
      )}

      {/* Input OTP */}
      <View className="items-center mb-4">
        <AppOtpInput
          value={otp}
          onChangeText={setOtp}
          numberOfDigits={6}
        />
      </View>

      {/* Hiển thị thời gian đếm */}
      <Text className="text-center text-primary font-InterBold mb-2">
        {formatTime(timeLeft)}
      </Text>

      {/* Nút gửi lại OTP */}
      <View className="flex-row justify-center items-center mb-6">
        <Text className="text-secondary">Không nhận được mã? </Text>
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={timeLeft > 0 || isLoading}
        >
          <Text
            className={`text-primary font-InterBold ${
              timeLeft > 0 ? "text-gray-400" : "text-primary"
            }`}
          >
            Gửi lại OTP
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nút xác nhận */}
      <AppButton
        title={isLoading ? "Đang xử lý..." : "Xác nhận"}
        filled
        onPress={handleVerifyOtp}
        disabled={isLoading}
      />
    </View>
  );
}