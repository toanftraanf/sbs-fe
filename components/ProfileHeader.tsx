import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
  onPress?: () => void;
}

export default function ProfileHeader({
  name,
  subtitle,
  onPress,
}: ProfileHeaderProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-4">
          <Ionicons name="person" size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-InterBold text-gray-800">{name}</Text>
          <Text className="text-sm text-gray-500">{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
