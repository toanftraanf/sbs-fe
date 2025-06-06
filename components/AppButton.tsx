import React from "react";
import { Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  filled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function AppButton({
  title,
  onPress,
  filled = true,
  style,
  textStyle,
  disabled = false,
}: AppButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-full rounded-2xl items-center justify-center mt-2 mb-2 ${
        filled
          ? disabled
            ? "bg-gray-400"
            : "bg-primary"
          : disabled
          ? "bg-gray-100 border-2 border-gray-400"
          : "bg-white border-2 border-primary"
      }`}
      style={[{ paddingVertical: 14 }, style]}
      activeOpacity={0.8}
    >
      <Text
        className={`font-InterBold text-lg ${
          filled ? "text-white" : disabled ? "text-gray-400" : "text-primary"
        }`}
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
