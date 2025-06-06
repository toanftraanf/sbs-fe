import AppOtpInput from "@/components/AppOtpInput";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import authService from "../../services/auth";

export default function VerifyOtp() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const phoneNumber = params.phoneNumber as string;
      if (!phoneNumber) {
        throw new Error("Số điện thoại không hợp lệ");
      }

      const result = await authService.login(phoneNumber, otp);

      if (result) {
        // Successfully logged in
        router.replace("/(tabs)/index" as any);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Xác thực OTP thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white px-6 pt-10">
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Ionicons name="arrow-back" size={28} color="#515151" />
        </TouchableOpacity>

        {/* Title */}
        <Text className="font-InterBold text-2xl text-secondary mb-2">
          XÁC NHẬN OTP
        </Text>
        <Text className="text-secondary mb-6">
          Vui lòng nhập mã OTP đã được{"\n"}gửi qua số điện thoại của bạn
        </Text>

        {/* Error Message */}
        {error && (
          <Text className="text-red-500 mb-4 text-center">{error}</Text>
        )}

        {/* OTP Inputs */}
        <View className="items-center mb-4">
          <AppOtpInput value={otp} onChangeText={setOtp} numberOfDigits={6} />
        </View>

        {/* Timer */}
        <Text className="text-center text-primary font-InterBold mb-2">
          00:00
        </Text>

        {/* Divider */}
        <View className="w-full h-0.5 bg-[#E0E0E0] my-2" />

        {/* Resend OTP */}
        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-secondary">Không nhận được mã? </Text>
          <TouchableOpacity>
            <Text className="text-primary font-InterBold">Gửi lại OTP</Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <AppButton
          title={isLoading ? "Đang xử lý..." : "Xác nhận"}
          filled
          onPress={handleVerifyOTP}
          disabled={isLoading}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
