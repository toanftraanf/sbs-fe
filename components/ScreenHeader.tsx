import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  showBorder?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightIcon,
  onRightPress,
  showBorder = true,
}) => {
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`w-full h-32 relative ${
        showBorder ? "border-b-primary border-b-2" : ""
      }`}
    >
      <View className="flex-row items-center justify-center mt-16">
        <TouchableOpacity className="absolute left-4" onPress={handleBackPress}>
          <Ionicons
            name="arrow-back-circle-outline"
            size={40}
            color="#7CB518"
          />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-primary">{title}</Text>

        {rightIcon && onRightPress && (
          <TouchableOpacity className="absolute right-4" onPress={onRightPress}>
            <Ionicons name={rightIcon} size={40} color="#7CB518" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ScreenHeader;
