import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface GenderSelectorProps {
  label: string;
  value: string | null;
  onChange: (gender: string) => void;
  containerClassName?: string;
}

const GENDER_OPTIONS = [
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
];

export default function GenderSelector({
  label,
  value,
  onChange,
  containerClassName = "mb-4",
}: GenderSelectorProps) {
  return (
    <View className={containerClassName}>
      <Text className="mb-1 font-InterSemiBold">{label}</Text>
      <View className="flex-row">
        {GENDER_OPTIONS.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            className={`flex-row items-center ${index === 0 ? "mr-6" : ""} ${
              value === option.value
                ? "border-primary border-2"
                : "border-gray-300 border"
            } rounded-full px-4 py-2`}
            onPress={() => onChange(option.value)}
          >
            <View
              className={`w-4 h-4 rounded-full border-2 mr-2 ${
                value === option.value
                  ? "border-primary bg-primary"
                  : "border-gray-400"
              }`}
            />
            <Text className="font-InterSemiBold">{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
