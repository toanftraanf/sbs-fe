import AppButton from "@/components/AppButton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import CourtTypeSelector from "../../components/CourtTypeSelector";
import DateSelector from "../../components/DateSelector";
import StadiumSports from "../../components/StadiumSports";
import TimeSlotGrid from "../../components/TimeSlotGrid";

const sports = [
  { key: "tennis", label: "Quần vợt", enabled: true },
  { key: "badminton", label: "Cầu lông", enabled: false },
  { key: "tabletennis", label: "Bóng bàn", enabled: true },
  { key: "pickleball", label: "Pickleball", enabled: false },
];
const courtTypes = [
  { key: "indoor", label: "Trong nhà" },
  { key: "outdoor", label: "Ngoài trời" },
];
const dates = [
  { key: "2024-05-26", day: "Thứ Hai", date: "26", month: "Tháng 5" },
  { key: "2024-05-27", day: "Thứ Ba", date: "27", month: "Tháng 5" },
  { key: "2024-05-28", day: "Thứ Tư", date: "28", month: "Tháng 5" },
  { key: "2024-05-29", day: "Thứ Năm", date: "29", month: "Tháng 5" },
  { key: "2024-05-30", day: "Thứ Sáu", date: "30", month: "Tháng 5" },
];
const courts = ["Sân A1", "Sân B1", "Sân B2", "Sân C1"];
const timeSlots = [
  "07:00 - 07:30",
  "07:30 - 08:00",
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:00 - 09:30",
  "09:30 - 10:00",
];
// Example slot status: lock, selected, available
const slotStatus = [
  ["lock", "selected", "available", "available"],
  ["lock", "available", "available", "available"],
  ["available", "available", "available", "available"],
  ["available", "available", "available", "available"],
  ["available", "available", "available", "available"],
  ["available", "available", "available", "available"],
];

const test = () => {
  console.log("test");
};

export default function BookingDetail() {
  const [selectedSport, setSelectedSport] = useState(sports[0].key);
  const [selectedCourtType, setSelectedCourtType] = useState(courtTypes[0].key);
  const [selectedDate, setSelectedDate] = useState(dates[0].key);
  const [selectedSlots, setSelectedSlots] = useState([[1, 1]]); // [row, col]

  const handleSlotPress = (rowIdx: number, colIdx: number) => {
    // TODO: handle slot selection
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* Header */}
      <View className="w-full h-32 relative border-b-primary border-b-2">
        <View className="flex-row items-center justify-center mt-16">
          <TouchableOpacity
            className="absolute left-4"
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={40}
              color="#7CB518"
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-primary">Đặt Lịch</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-gray-100"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Sport selection */}
        <View className="px-4 pt-4 pb-2">
          <Text className="font-medium text-[#444] mb-2">Môn thể thao</Text>
          <StadiumSports
            sports={sports.map(({ key, label }) => ({ key, label }))}
            onSelect={(key) => setSelectedSport(key)}
          />
        </View>

        {/* Court type toggle */}
        <View className="px-4 mb-2">
          <Text className="font-medium text-[#444] mb-2">Loại sân</Text>
          <CourtTypeSelector
            courtTypes={courtTypes}
            selectedKey={selectedCourtType}
            onSelect={setSelectedCourtType}
          />
        </View>

        {/* Date selector */}
        <View className="px-4 mb-2">
          <Text className="font-medium text-[#444] mb-2">Lịch các sân</Text>
          <DateSelector
            dates={dates}
            selectedKey={selectedDate}
            onSelect={setSelectedDate}
          />
        </View>

        {/* Time slot/court grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
        >
          <TimeSlotGrid
            timeSlots={timeSlots}
            courts={courts}
            slotStatus={slotStatus}
            onSlotPress={handleSlotPress}
          />
        </ScrollView>
      </ScrollView>

      {/* Footer buttons */}
      <View className="flex-row px-4 pb-6 pt-2 bg-white border-t border-[#C7D7B5]">
        <View className="flex-1 mr-2">
          <AppButton title="Hủy bỏ" filled={false} onPress={() => {}} />
        </View>
        <View className="flex-1">
          <AppButton title="Hoàn tất" onPress={() => {}} />
        </View>
      </View>
    </View>
  );
}
