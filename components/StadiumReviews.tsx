import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

interface StadiumReviewsProps {
  reviews: Review[];
}

const StadiumReviews: React.FC<StadiumReviewsProps> = ({ reviews }) => (
  <>
    {reviews.map((review) => (
      <View
        key={review.id}
        className="flex-row items-center bg-gray-100 rounded-xl p-3 mt-2"
      >
        <View className="flex-1">
          <Text className="font-bold text-sm text-gray-900">{review.name}</Text>
          <Text className="text-gray-500 text-xs mb-1">{review.comment}</Text>
        </View>
        <View className="items-center">
          <Text className="text-green-600 font-bold text-base mb-1">
            {review.rating}{" "}
            <FontAwesome name="star" size={14} color="#FFD600" />
          </Text>
          <TouchableOpacity>
            <MaterialIcons name="chevron-right" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </>
);

export default StadiumReviews;
