import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface SettingsMenuItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  showArrow?: boolean;
  backgroundColor?: string;
  variant?: "customer" | "owner";
  isDestructive?: boolean;
  iconBackgroundColor?: string;
  style?: ViewStyle;
  containerClassName?: string;
}

export default function SettingsMenuItem({
  title,
  icon,
  iconColor = "#5A983B",
  onPress,
  showArrow = true,
  backgroundColor = "transparent",
  variant = "customer",
  isDestructive = false,
  iconBackgroundColor,
  style,
  containerClassName,
}: SettingsMenuItemProps) {
  const isOwnerVariant = variant === "owner";

  // Determine icon background color for owner variant
  const ownerIconBgColor = iconBackgroundColor
    ? `${iconBackgroundColor}15`
    : `${iconColor}15`;

  // Base container classes
  const baseContainerClass = "flex-row items-center justify-between";

  // Variant-specific styling
  const customerContainerClass = `${baseContainerClass} py-4 px-4 border-b border-gray-100`;
  const ownerContainerClass = `${baseContainerClass} bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-100`;

  const containerClass = isOwnerVariant
    ? ownerContainerClass
    : customerContainerClass;

  // Final container class with custom additions
  const finalContainerClass = containerClassName
    ? `${containerClass} ${containerClassName}`
    : containerClass;

  // Text color based on variant and destructive state
  const textColor = isDestructive
    ? "text-red-600"
    : isOwnerVariant
    ? "text-gray-800"
    : "text-gray-800";

  // Font weight
  const fontWeight = isOwnerVariant ? "font-InterMedium" : "";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={finalContainerClass}
      style={[{ backgroundColor }, style]}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        {isOwnerVariant ? (
          // Owner variant: Colored background circle
          <View
            className="w-10 h-10 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: ownerIconBgColor }}
          >
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        ) : (
          // Customer variant: Simple icon container
          <View className="w-8 h-8 items-center justify-center mr-3">
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        <Text className={`text-base flex-1 ${textColor} ${fontWeight}`}>
          {title}
        </Text>
      </View>
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isOwnerVariant ? "#CBD5E0" : "#9CA3AF"}
        />
      )}
    </TouchableOpacity>
  );
}
