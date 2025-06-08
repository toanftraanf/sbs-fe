import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface RoleToggleProps {
  label: string;
  value: "player" | "coach";
  onChange: (role: "player" | "coach") => void;
  containerClassName?: string;
}

const ROLE_OPTIONS = [
  { label: "Người chơi", value: "player" as const },
  { label: "Huấn luyện viên", value: "coach" as const },
];

export default function RoleToggle({
  label,
  value,
  onChange,
  containerClassName = "mb-4",
}: RoleToggleProps) {
  return (
    <View className={containerClassName}>
      <Text className="mb-1 font-InterSemiBold">{label}</Text>
      <View className="flex-row bg-gray-100 rounded-xl overflow-hidden">
        {ROLE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`flex-1 py-3 items-center ${
              value === option.value ? "bg-primary" : ""
            }`}
            onPress={() => onChange(option.value)}
          >
            <Text
              className={`font-InterBold ${
                value === option.value ? "text-white" : "text-primary"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
