import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function Checkbox({
  checked,
  onToggle,
  label,
  disabled = false,
  size = "medium",
  className = "",
}: CheckboxProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-5 h-5",
    large: "w-6 h-6",
  };

  const iconSizes = {
    small: 12,
    medium: 14,
    large: 16,
  };

  const handlePress = () => {
    if (!disabled) {
      onToggle(!checked);
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center ${className}`}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View
        className={`${
          sizeClasses[size]
        } rounded border-2 items-center justify-center mr-3 ${
          checked ? "bg-[#4CAF50] border-[#4CAF50]" : "bg-white border-gray-300"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {checked && (
          <Ionicons name="checkmark" size={iconSizes[size]} color="#fff" />
        )}
      </View>
      {label && (
        <Text
          className={`text-[#444] text-base font-InterMedium flex-1 ${
            disabled ? "opacity-50" : ""
          }`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
