import { StadiumCardProps } from "@/types/stadium";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";

const StadiumCard: React.FC<StadiumCardProps> = ({
  stadium,
  index,
  scrollX,
  onPress,
}) => {
  const inputRange = [
    (index - 1) * (220 + 16),
    index * (220 + 16),
    (index + 1) * (220 + 16),
  ];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1.15, 0.85],
    extrapolate: "clamp",
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      className="w-[220px] min-h-[160px] bg-white rounded-2xl mr-4 shadow-sm mt-2 overflow-hidden"
      style={{ transform: [{ scale }], opacity }}
    >
      <Image
        source={{ uri: stadium.image }}
        className="w-full h-20 rounded-t-2xl flex-shrink-0"
      />
      <View className="flex-1 p-3 flex flex-col min-h-20">
        <View className="flex-row items-center justify-between mb-1 flex-shrink-0">
          <Text
            className="font-bold text-[15px] text-[#222] flex-1 mr-2"
            numberOfLines={1}
          >
            {stadium.name}
          </Text>
          <View className="flex-row items-center flex-shrink-0">
            <Ionicons name="star" size={12} color="#7CB518" />
            <Text className="text-[#7CB518] text-xs font-semibold ml-0.5">
              {stadium.rating}
            </Text>
          </View>
        </View>
        <Text
          className="text-[#888] text-xs leading-4 mb-2 flex-grow flex-shrink-1"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {stadium.address}
        </Text>
        <TouchableOpacity
          className="bg-[#E6F4EA] rounded-lg py-2 items-center flex-shrink-0 min-h-[36px]"
          onPress={onPress}
        >
          <Text className="text-[#7CB518] font-bold text-sm">Đặt lịch</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default StadiumCard;
