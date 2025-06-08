import AppOtpInput from "@/components/AppOtpInput";
import { useOtpVerification } from "@/hooks/useOtpVerification";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AppButton from "../../components/AppButton";

export default function VerifyOtp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber: string }>();
  const phoneNumber = params.phoneNumber || "";

  const {
    otp,
    setOtp,
    isLoading,
    error,
    timeLeft,
    formatTime,
    handleResendOtp,
    handleVerifyOtp,
  } = useOtpVerification({ phoneNumber });

  return (
    <View className="flex-1 bg-white px-6 pt-10">
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
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
      {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}

      {/* Input OTP */}
      <View className="items-center mb-4">
        <AppOtpInput value={otp} onChangeText={setOtp} numberOfDigits={6} />
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
