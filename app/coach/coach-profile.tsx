import AppHeader from "@/components/AppHeader";
import CoachDetailView from "@/components/CoachDetailView";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, Text, View } from "react-native";

export default function CoachProfileScreen() {
  const { coachId } = useLocalSearchParams<{ coachId: string }>();

  const handleBookSession = () => {
    if (coachId) {
      // Navigate to booking screen with coach info
      router.push({
        pathname: "/coach/book-session",
        params: { coachId },
      });
    } else {
      Alert.alert("Lỗi", "Không tìm thấy thông tin huấn luyện viên");
    }
  };

  if (!coachId) {
    return (
      <View className="flex-1 bg-white">
        <AppHeader title="Hồ sơ huấn luyện viên" showBack={true} />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 text-center text-lg">
            Không tìm thấy thông tin huấn luyện viên
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Hồ sơ huấn luyện viên" showBack={true} />
      <CoachDetailView
        coachId={coachId}
        onBookSession={handleBookSession}
        showBookButton={true}
      />
    </View>
  );
}
