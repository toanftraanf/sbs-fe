import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ToggleOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface ToggleProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ToggleOption[];
  containerClassName?: string;
  showIcons?: boolean;
}

// Default role options for backward compatibility
const DEFAULT_ROLE_OPTIONS: ToggleOption[] = [
  { label: "Người chơi", value: "player" },
  { label: "Huấn luyện viên", value: "coach" },
];

export default function Toggle({
  label,
  value,
  onChange,
  options = DEFAULT_ROLE_OPTIONS,
  containerClassName = "mb-4",
  showIcons = false,
}: ToggleProps) {
  return (
    <View className={containerClassName}>
      <Text className="mb-1 font-InterSemiBold">{label}</Text>
      <View className="flex-row bg-gray-100 rounded-xl overflow-hidden">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`flex-1 py-3 items-center justify-center ${
              value === option.value ? "bg-primary" : ""
            }`}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              {showIcons && option.icon && (
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={value === option.value ? "#fff" : "#5A983B"}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text
                className={`font-InterBold ${
                  value === option.value ? "text-white" : "text-primary"
                }`}
              >
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
