import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import AppTextInput from "../../components/AppTextInput";
// import GoogleLoginButton from "../../components/GoogleLoginButton";
import { icons } from "../../constants";
import authService from "../../services/auth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!phone) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Format phone number to remove any spaces or special characters
      let formattedPhone = phone.replace(/\D/g, "");

      // Ensure phone number starts with 0 for Vietnamese format
      if (!formattedPhone.startsWith("0") && formattedPhone.length >= 9) {
        formattedPhone = "0" + formattedPhone;
      }

      console.log("🔄 Login attempt for phone:", formattedPhone);
      console.log("📱 Original input:", phone);
      console.log("📱 Formatted phone:", formattedPhone);

      // First check if user exists as CUSTOMER
      console.log("🔍 Checking if user exists as CUSTOMER...");
      let user = await authService.checkExistingUser(
        formattedPhone,
        "CUSTOMER"
      );

      console.log("📋 CUSTOMER check result:", user);

      // If not found as CUSTOMER, check as OWNER
      if (!user) {
        console.log("🔍 Not found as CUSTOMER, checking as OWNER...");
        user = await authService.checkExistingUser(formattedPhone, "OWNER");
        console.log("📋 OWNER check result:", user);
      }

      if (user) {
        console.log("✅ User found, proceeding to OTP verification");
        console.log("👤 User details:", user);
        // User exists, proceed to OTP verification for login
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { phoneNumber: formattedPhone, isLogin: "true" },
        });
      } else {
        console.log("❌ User not found, redirecting to registration");
        // User doesn't exist, redirect to registration
        router.push({
          pathname: "/(auth)/register-user",
          params: { phoneNumber: formattedPhone },
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white px-6 pt-10">
        {/* Back Arrow */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            className="text-secondary pb-10"
            name="arrow-back-circle-outline"
            size={40}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text className="font-InterBold text-2xl text-secondary mb-5">
          ĐĂNG NHẬP
        </Text>
        <Text className="font-InterSemiBold text-secondary mb-6">
          SportNow sẽ gửi mã OTP qua số{"\n"}điện thoại của bạn
        </Text>

        {/* Phone Input */}
        <AppTextInput
          left={
            <View className="flex-row items-center">
              <Text className="text-secondary font-InterBold mr-1">+84</Text>
              <Image source={icons.arrow_down} className="w-3 h-3" />
            </View>
          }
          placeholder="Điện thoại"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          containerClassName="mb-8"
        />

        {/* Error Message */}
        {error && (
          <Text className="text-red-500 mb-4 text-center">{error}</Text>
        )}

        {/* Divider */}
        <View className="w-full h-0.5 bg-[#E0E0E0] my-6" />

        {/* OTP Button */}
        <AppButton
          title={isLoading ? "Đang xử lý..." : "Gửi mã OTP"}
          filled
          onPress={handleSendOTP}
          disabled={isLoading}
        />

        {/* Or divider */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-px bg-[#B0B0B0]" />
          <Text className="mx-2 text-secondary">Hoặc đăng nhập với</Text>
          <View className="flex-1 h-px bg-[#B0B0B0]" />
        </View>

        {/* Google Login Button */}
        {/* <GoogleLoginButton
          title="Google"
          disabled={isLoading}
          onError={handleGoogleLoginError} */}
        {/* /> */}

        {/* Register Link */}
        <View className="flex-row justify-center mt-2">
          <Text className="text-secondary">Chưa có tài khoản? </Text>
          <TouchableOpacity>
            <Text
              className="text-primary font-InterBold"
              onPress={() => router.push("/(auth)/register")}
            >
              Đăng ký ngay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
