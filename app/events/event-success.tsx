import AppButton from "@/components/AppButton";
import AppHeader from "@/components/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function EventSuccessScreen() {
  const handleGoToTeamMatching = () => {
    // Navigate to team matching (tabs) screen
    router.replace("/(tabs)/team-matching");
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Tạo Sự Kiện Thành Công" />

      <View className="flex-1 justify-center items-center px-6">
        {/* Success Icon */}
        <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-8">
          <Ionicons name="checkmark" size={48} color="white" />
        </View>

        {/* Success Message */}
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Bạn đã thành công
        </Text>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-8">
          tạo sự kiện
        </Text>

        {/* Description */}
        <Text className="text-gray-600 text-center text-base leading-6 mb-12 px-4">
          Hãy quay về trang Ghép đội để xem những{"\n"}
          sự kiện có trong lịch trình của mình!
        </Text>

        {/* Action Button */}
        <View className="w-full px-4">
          <AppButton
            title="Về Trang Ghép đôi"
            filled
            onPress={handleGoToTeamMatching}
          />
        </View>
      </View>
    </View>
  );
}
