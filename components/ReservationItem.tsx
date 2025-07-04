import { Reservation } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ReservationItemProps {
  reservation: Reservation;
  onPress?: () => void;
  showActionButton?: boolean;
}

const ReservationItem: React.FC<ReservationItemProps> = ({
  reservation,
  onPress,
  showActionButton = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600";
      case "PENDING":
        return "text-orange-600";
      case "CANCELLED":
        return "text-red-600";
      case "COMPLETED":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PENDING":
        return "Chờ xác nhận";
      case "CANCELLED":
        return "Đã hủy";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getUserInitial = () => {
    const name = reservation.user?.fullName;
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return "?";
  };

  const renderUserAvatar = () => {
    const user = reservation.user;
    if (!user) {
      return (
        <View className="w-12 h-12 rounded-lg bg-gray-200 items-center justify-center">
          <Ionicons name="person" size={20} color="#9CA3AF" />
        </View>
      );
    }

    // Check if user has avatar file with url
    if (user.avatar?.url) {
      return (
        <Image
          source={{ uri: user.avatar.url }}
          className="w-12 h-12 rounded-lg"
          style={{ resizeMode: "cover" }}
          onError={(error) => {
            console.log(
              "❌ Avatar image failed to load:",
              error.nativeEvent.error
            );
            console.log("Failed URL:", user.avatar?.url);
          }}
          onLoad={() => {
            console.log("✅ Avatar image loaded successfully");
          }}
        />
      );
    }

    // Fallback to initials if no avatar file
    console.log("⚠️ Using fallback initials - no avatar data");
    return (
      <View className="w-12 h-12 rounded-lg bg-green-500 items-center justify-center">
        <Text className="text-white font-bold text-sm">{getUserInitial()}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl flex-row items-center p-3 mb-2 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      {/* User Avatar */}
      <View className="mr-3">{renderUserAvatar()}</View>

      {/* Reservation Details */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="font-InterBold text-gray-900 text-base">
            {reservation.user?.fullName || "Khách hàng"}
          </Text>
          <Text
            className={`text-xs font-medium ${getStatusColor(
              reservation.status
            )}`}
          >
            {getStatusText(reservation.status)}
          </Text>
        </View>

        <Text className="text-sm text-gray-600 mb-1">
          {`${reservation.sport || "Thể thao"}: Sân ${
            reservation.courtNumber || "N/A"
          }`}
        </Text>

        <Text className="text-sm text-gray-700 font-medium mb-1">
          {reservation.startTime} - {reservation.endTime}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-500">
            {new Date(reservation.date).toLocaleDateString("vi-VN")}
          </Text>
          <Text className="text-sm font-bold text-primary">
            {formatPrice(Number(reservation.totalPrice) || 0)}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      {showActionButton && (
        <TouchableOpacity onPress={onPress} className="ml-3 p-2">
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default ReservationItem;
