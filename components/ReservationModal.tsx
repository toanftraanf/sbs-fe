import { updateReservationStatus } from "@/services/reservation";
import { Reservation } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ReservationModalProps {
  visible: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onStatusChange?: (
    reservationId: number,
    newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  visible,
  reservation,
  onClose,
  onStatusChange,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600 bg-green-100";
      case "PENDING":
        return "text-orange-600 bg-orange-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      case "COMPLETED":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
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

  const handleStatusChange = async (
    newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) => {
    if (!reservation) return;

    const statusMessages = {
      CONFIRMED: "xác nhận",
      CANCELLED: "hủy",
      COMPLETED: "hoàn thành",
      PENDING: "đặt về chờ xác nhận",
    };

    Alert.alert(
      "Thay đổi trạng thái",
      `Bạn có chắc chắn muốn ${statusMessages[newStatus]} lịch đặt này?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUpdating(true);

              // Validate reservation data
              if (!reservation.id) {
                console.error("❌ Missing reservation ID:", reservation);
                throw new Error(
                  "Reservation ID is missing. Cannot update status."
                );
              }

              console.log(
                `🔄 Updating reservation ${reservation.id} status to ${newStatus}`
              );

              // Log complete reservation data for debugging
              console.log("🐛 Complete reservation object:", {
                id: reservation.id,
                userId: reservation.userId,
                stadiumId: reservation.stadiumId,
                status: reservation.status,
                courtNumber: reservation.courtNumber,
                startTime: reservation.startTime,
                endTime: reservation.endTime,
                date: reservation.date,
                totalPrice: reservation.totalPrice,
                sport: reservation.sport,
                courtType: reservation.courtType,
                user: reservation.user,
                stadium: reservation.stadium,
              });

              // Call API to update reservation status
              await updateReservationStatus(reservation.id, newStatus);

              console.log(
                `✅ Successfully updated reservation status to ${newStatus}`
              );

              // Call the parent component's callback to update local state
              if (onStatusChange) {
                onStatusChange(reservation.id, newStatus);
              }

              // Close modal
              onClose();

              // Show success message
              Alert.alert(
                "Thành công",
                `Đã ${statusMessages[newStatus]} lịch đặt thành công!`,
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("💥 Error updating reservation status:", error);

              // Show error message
              Alert.alert(
                "Lỗi",
                `Không thể ${statusMessages[newStatus]} lịch đặt. Vui lòng thử lại sau.`,
                [{ text: "OK" }]
              );
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  if (!reservation) return null;

  // Debug logging
  console.log("🐛 Modal reservation data:", {
    totalPrice: reservation.totalPrice,
    totalPriceType: typeof reservation.totalPrice,
    date: reservation.date,
    createdAt: reservation.createdAt,
    courtNumber: reservation.courtNumber,
    stadium: reservation.stadium,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-900">
            Chi tiết lịch đặt
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="close" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Reservation Info */}
          <View className="bg-white p-4">
            {/* Status */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-semibold text-gray-900">
                Trạng thái
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${getStatusColor(
                  reservation.status
                )}`}
              >
                <Text className="text-sm font-medium">
                  {getStatusText(reservation.status)}
                </Text>
              </View>
            </View>

            {/* Booking Details */}
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Thông tin lịch đặt
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Môn thể thao:</Text>
                  <Text className="font-medium text-gray-900">
                    {reservation.sport || "Không có thông tin"}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Loại sân:</Text>
                  <Text className="font-medium text-gray-900">
                    {reservation.courtType || "Không có thông tin"}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Số sân:</Text>
                  <Text className="font-medium text-gray-900">
                    {reservation.stadium?.fields?.find(
                      (field) => field.id === reservation.courtNumber
                    )?.fieldName || `Sân ${reservation.courtNumber}`}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Ngày:</Text>
                  <Text className="font-medium text-gray-900">
                    {reservation.date
                      ? new Date(reservation.date)
                          .toLocaleDateString("vi-VN")
                          .includes("Invalid")
                        ? reservation.date
                        : new Date(reservation.date).toLocaleDateString("vi-VN")
                      : "Không có thông tin"}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Giờ:</Text>
                  <Text className="font-medium text-gray-900">
                    {reservation.startTime} - {reservation.endTime}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Tổng tiền:</Text>
                  <Text className="font-bold text-primary text-lg">
                    {formatPrice(Number(reservation.totalPrice) || 0)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Customer Info */}
            {reservation.user && (
              <View className="bg-gray-50 rounded-lg p-4 mb-4">
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  Thông tin khách hàng
                </Text>

                <View className="space-y-3">
                  {reservation.user.fullName && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Họ tên:</Text>
                      <Text className="font-medium text-gray-900">
                        {reservation.user.fullName}
                      </Text>
                    </View>
                  )}

                  {reservation.user.phoneNumber && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Số điện thoại:</Text>
                      <Text className="font-medium text-gray-900">
                        {reservation.user.phoneNumber}
                      </Text>
                    </View>
                  )}

                  {reservation.user.email && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Email:</Text>
                      <Text className="font-medium text-gray-900">
                        {reservation.user.email}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Booking History */}
            <View className="bg-gray-50 rounded-lg p-4 mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Lịch sử
              </Text>

              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Ngày đặt:</Text>
                  <Text className="font-medium text-gray-900">
                    {reservation.createdAt
                      ? new Date(reservation.createdAt)
                          .toLocaleDateString("vi-VN")
                          .includes("Invalid")
                        ? reservation.createdAt
                        : new Date(reservation.createdAt).toLocaleDateString(
                            "vi-VN"
                          )
                      : "Không có thông tin"}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Giờ đặt:</Text>
                  <Text className="font-medium text-gray-900">
                    {reservation.createdAt
                      ? new Date(reservation.createdAt)
                          .toLocaleTimeString("vi-VN")
                          .includes("Invalid")
                        ? reservation.createdAt
                        : new Date(reservation.createdAt).toLocaleTimeString(
                            "vi-VN"
                          )
                      : "Không có thông tin"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        {reservation.status !== "COMPLETED" && (
          <View className="border-t border-gray-200 p-4 bg-white">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Thay đổi trạng thái
            </Text>

            {isUpdating && (
              <View className="flex-row items-center justify-center py-3 mb-4">
                <ActivityIndicator size="small" color="#7CB518" />
                <Text className="ml-2 text-gray-600">Đang cập nhật...</Text>
              </View>
            )}

            <View className="space-y-3">
              {reservation.status !== "CONFIRMED" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("CONFIRMED")}
                  disabled={isUpdating}
                  className={`rounded-lg py-3 px-4 ${
                    isUpdating ? "bg-gray-400" : "bg-green-500"
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        className="mr-2"
                      />
                    )}
                    <Text className="text-white text-center font-semibold">
                      Xác nhận lịch đặt
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {reservation.status !== "CANCELLED" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("CANCELLED")}
                  disabled={isUpdating}
                  className={`rounded-lg py-3 px-4 ${
                    isUpdating ? "bg-gray-400" : "bg-red-500"
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        className="mr-2"
                      />
                    )}
                    <Text className="text-white text-center font-semibold">
                      Hủy lịch đặt
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {reservation.status === "CONFIRMED" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("COMPLETED")}
                  disabled={isUpdating}
                  className={`rounded-lg py-3 px-4 ${
                    isUpdating ? "bg-gray-400" : "bg-blue-500"
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        className="mr-2"
                      />
                    )}
                    <Text className="text-white text-center font-semibold">
                      Đánh dấu hoàn thành
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {reservation.status !== "PENDING" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("PENDING")}
                  disabled={isUpdating}
                  className={`rounded-lg py-3 px-4 ${
                    isUpdating ? "bg-gray-400" : "bg-orange-500"
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    {isUpdating && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        className="mr-2"
                      />
                    )}
                    <Text className="text-white text-center font-semibold">
                      Đặt về chờ xác nhận
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Show completion message when status is COMPLETED */}
        {reservation.status === "COMPLETED" && (
          <View className="border-t border-gray-200 p-4 bg-white">
            <View className="flex-row items-center justify-center py-4">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-3">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-green-600">
                  Hoàn thành
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ReservationModal;
