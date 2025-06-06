import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
import { icons } from "../../constants";

export default function RegisterOwner() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

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
        <Text className="font-InterSemiBold text-primary mb-6">
          Bạn đang đăng ký với tư cách chủ sân tập.{" "}
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
        <AppButton title="Gửi mã OTP" filled onPress={() => {}} />
      </View>
    </TouchableWithoutFeedback>
  );
}
