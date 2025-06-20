import ReservationModal from "@/components/ReservationModal";
import useBooking from "@/hooks/useBooking";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// Helper function to generate time slots from stadium operating hours
const generateTimeSlots = (
  startTime: string,
  endTime: string,
  slotDuration: number = 30
): string[] => {
  const slots: string[] = [];
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  let current = new Date(start);

  while (current < end) {
    const slotStart = current.toTimeString().slice(0, 5);
    current.setMinutes(current.getMinutes() + slotDuration);
    const slotEnd = current.toTimeString().slice(0, 5);

    if (current <= end) {
      slots.push(`${slotStart} - ${slotEnd}`);
    }
  }

  return slots;
};

export default function Booking() {
  const {
    profileLoading,
    showStadiumDropdown,
    setShowStadiumDropdown,
    activeTab,
    modalVisible,
    selectedReservation,
    handleStatusChange,
    setModalVisible,
  } = useBooking();

  if (profileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#7CB518" />
        <Text className="mt-4 text-gray-600">Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Overlay to close dropdown when tapped outside */}
      {showStadiumDropdown && (
        <TouchableOpacity
          className="absolute inset-0 z-40"
          onPress={() => setShowStadiumDropdown(false)}
          activeOpacity={1}
        />
      )}

      <View className="flex-1">
        {/* {activeTab === "schedule" && renderScheduleTab()} */}
        {/* {activeTab === "today" && renderTodayTab()} */}
      </View>

      {/* Reservation Modal */}
      <ReservationModal
        visible={modalVisible}
        reservation={selectedReservation}
        userRole="OWNER"
        onClose={() => setModalVisible(false)}
        onStatusChange={handleStatusChange}
      />
    </View>
  );
}
