import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function BookingSuccess() {
  const params = useLocalSearchParams();
  const {
    stadiumName,
    selectedSlots,
    totalPrice,
    selectedSport,
    selectedDate,
    courtType,
  } = params;

  const slots = selectedSlots ? JSON.parse(selectedSlots as string) : [];

  const handleGoHome = () => {
    router.push("/(tabs)/stadium-booking");
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Success Icon and Message */}
        <View className="items-center py-8">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Đặt sân thành công!
          </Text>
          <Text className="text-gray-600 text-center px-4">
            Booking của bạn đã được ghi nhận. Vui lòng kiểm tra thông tin chi
            tiết bên dưới.
          </Text>
        </View>

        {/* Booking Details Card */}
        <View className="bg-white mx-4 rounded-xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Chi tiết đặt sân
          </Text>

          {/* Stadium Name */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="location" size={20} color="#7CB518" />
            <Text className="ml-2 text-gray-700 font-medium">
              {stadiumName || "Sân thể thao"}
            </Text>
          </View>

          {/* Sport */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="tennisball" size={20} color="#7CB518" />
            <Text className="ml-2 text-gray-700">
              Môn: {selectedSport || "Tennis"}
            </Text>
          </View>

          {/* Date */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar" size={20} color="#7CB518" />
            <Text className="ml-2 text-gray-700">
              Ngày: {selectedDate || "Hôm nay"}
            </Text>
          </View>

          {/* Court Type */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="business" size={20} color="#7CB518" />
            <Text className="ml-2 text-gray-700">
              Loại sân: {courtType === "indoor" ? "Trong nhà" : "Ngoài trời"}
            </Text>
          </View>

          {/* Time Slots */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={20} color="#7CB518" />
              <Text className="ml-2 text-gray-700 font-medium">
                Khung giờ đã đặt:
              </Text>
            </View>
            {slots.map((slot: any, index: number) => (
              <View key={index} className="ml-6 mb-1">
                <Text className="text-gray-600">
                  • Sân {slot.courtNumber}: {slot.timeSlot}
                </Text>
              </View>
            ))}
          </View>

          {/* Total Price */}
          <View className="border-t border-gray-200 pt-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">
                Tổng chi phí:
              </Text>
              <Text className="text-xl font-bold text-primary">
                {totalPrice ? Number(totalPrice).toLocaleString("vi-VN") : "0"}{" "}
                VNĐ
              </Text>
            </View>
          </View>
        </View>

        {/* Status Card */}
        <View className="bg-yellow-50 border border-yellow-200 mx-4 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={24} color="#F59E0B" />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-yellow-800 mb-1">
                Trạng thái: Đang chờ xác nhận
              </Text>
              <Text className="text-sm text-yellow-700">
                Sân sẽ liên hệ với bạn để xác nhận booking trong thời gian sớm
                nhất.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View className="bg-blue-50 border border-blue-200 mx-4 rounded-xl p-4">
          <Text className="font-semibold text-blue-800 mb-2">Cần hỗ trợ?</Text>
          <Text className="text-sm text-blue-700 mb-2">
            Nếu có thắc mắc, vui lòng liên hệ trực tiếp với sân hoặc hotline hỗ
            trợ.
          </Text>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="call" size={16} color="#3B82F6" />
            <Text className="ml-1 text-blue-600 font-medium">
              1900-xxxx-xxx
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handleGoHome}
        >
          <Text className="text-white font-bold text-lg">Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const options = {
  headerShown: false,
};
