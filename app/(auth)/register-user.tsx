import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
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

export default function RegisterUser() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLoginError = (errorMessage: string) => {
    // setError(errorMessage);
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    try {
      setLoading(true);
      const formattedPhone = phone.startsWith("0") ? phone : `0${phone}`;

      console.log("🔄 Starting CUSTOMER registration for:", formattedPhone);

      await authService.registerCustomer(formattedPhone, fullName.trim());

      console.log(
        "✅ Customer registration successful, navigating to OTP verification"
      );

      router.push({
        pathname: "/(auth)/verify-otp",
        params: { phoneNumber: formattedPhone },
      });
    } catch (error) {
      console.error("❌ Registration failed:", error);
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Đã có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
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
          ĐĂNG KÝ
        </Text>
        <Text className="font-InterSemiBold text-secondary mb-6">
          SportNow sẽ gửi mã OTP qua số{"\n"}điện thoại của bạn
        </Text>

        {/* Full Name Input */}
        <AppTextInput
          left={<Ionicons name="person" size={22} color="#515151" />}
          placeholder="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
          containerClassName="mb-4"
        />

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

        {/* Divider */}
        <View className="w-full h-0.5 bg-[#E0E0E0] my-6" />

        {/* OTP Button */}
        <AppButton
          title={loading ? "Đang xử lý..." : "Gửi mã OTP"}
          filled
          onPress={handleRegister}
          disabled={loading}
        />

        {/* Or divider */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-px bg-[#B0B0B0]" />
          <Text className="mx-2 text-secondary">Hoặc đăng ký với</Text>
          <View className="flex-1 h-px bg-[#B0B0B0]" />
        </View>

        {/* Google Login Button */}
        {/* <GoogleLoginButton title="Google" onError={handleGoogleLoginError} /> */}

        {/* Login Link */}
        <View className="flex-row justify-center mt-2">
          <Text className="text-secondary">Đã có tài khoản? </Text>
          <TouchableOpacity>
            <Text
              className="text-primary font-InterBold"
              onPress={() => router.push("/(auth)/login")}
            >
              Đăng nhập ngay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
