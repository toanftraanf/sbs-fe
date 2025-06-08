import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SettingsMenuItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  showArrow?: boolean;
  backgroundColor?: string;
}

export default function SettingsMenuItem({
  title,
  icon,
  iconColor = "#5A983B",
  onPress,
  showArrow = true,
  backgroundColor = "transparent",
}: SettingsMenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100"
      style={{ backgroundColor }}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text className="text-base text-gray-800 flex-1">{title}</Text>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
}
