import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder: string;
  maximumDate?: Date;
  containerClassName?: string;
}

export default function DatePickerField({
  label,
  value,
  onChange,
  placeholder,
  maximumDate,
  containerClassName = "mb-4",
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selectedDate) onChange(selectedDate);
    } else {
      if (selectedDate) onChange(selectedDate);
      setShowPicker(false);
    }
  };

  return (
    <View className={containerClassName}>
      <Text className="mb-1 font-InterSemiBold">{label}</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="flex-row items-center border border-secondary rounded-xl px-4 py-3"
      >
        <Text className={`flex-1 ${value ? "text-black" : "text-gray-400"}`}>
          {value ? value.toLocaleDateString("vi-VN") : placeholder}
        </Text>
        <Ionicons name="calendar" size={22} color="#515151" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}
