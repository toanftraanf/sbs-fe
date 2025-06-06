import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface StadiumRatingsProps {
  rating: number;
}

const StadiumRatings: React.FC<StadiumRatingsProps> = ({ rating }) => (
  <View className="flex-row items-center">
    <Text className="font-bold text-base text-gray-900">Đánh giá</Text>
    <Text className="text-green-600 font-bold text-lg mx-3">
      {rating.toFixed(1)}
    </Text>
    <View className="flex-row ml-1">
      {[...Array(5)].map((_, i) => (
        <FontAwesome
          key={i}
          name="star"
          size={18}
          color={i < Math.round(rating) ? "#FFD600" : "#ccc"}
        />
      ))}
    </View>
  </View>
);

export default StadiumRatings;
