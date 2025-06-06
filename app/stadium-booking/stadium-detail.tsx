import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import StadiumContact from "../../components/StadiumContact";
import StadiumRatings from "../../components/StadiumRatings";
import StadiumReviews from "../../components/StadiumReviews";
import StadiumSports from "../../components/StadiumSports";

const { width } = Dimensions.get("window");

const sports = [
  { key: "badminton", label: "Quần vợt" },
  { key: "football", label: "Bóng bàn" },
];

const reviews = [
  {
    id: 1,
    name: "Huỳnh viên k",
    rating: 5,
    comment: "Thân thiện, kĩ năng tốt.",
  },
  {
    id: 2,
    name: "Huỳnh viên k",
    rating: 5,
    comment: "Thân thiện, kĩ năng tốt.",
  },
];

export default function StadiumDetail() {
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams();
  const stadium = JSON.parse(params.stadium as string);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image with overlay buttons */}
        <View className="w-full h-44 relative">
          <Image
            source={{ uri: stadium.image }}
            className="w-full h-full rounded-b-2xl"
          />
          <TouchableOpacity
            className="absolute top-4 left-4 bg-white rounded-full p-1.5 shadow"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow">
            <Ionicons name="share-social-outline" size={24} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Stadium Info */}
        <View className="px-4 py-4">
          <Text className="font-bold text-xl text-gray-900 mb-1">
            {stadium.name}
          </Text>
          <View className="flex-row items-center mb-1">
            <MaterialIcons name="calendar-today" size={18} color="#888" />
            <Text className="ml-1 text-gray-600 text-sm">
              Mon-Fri: 11-18PM, Sat & Sun: 7-18PM
            </Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={18} color="#888" />
            <Text className="ml-1 text-gray-600 text-sm flex-1 flex-wrap">
              Số 12, Đường A3, P. Long Thạnh Mỹ, Thủ Đức, TP. HCM
            </Text>
          </View>
          <TouchableOpacity className="mt-2 self-start bg-green-50 rounded-lg px-4 py-1.5">
            <Text className="text-green-600 font-bold text-sm">
              Xem trên bản đồ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sports */}
        <View className="h-px bg-gray-200 my-3" />
        <View className="px-4 pt-2">
          <Text className="font-bold text-base text-gray-900">
            Các môn hiện có
          </Text>
          <Text className="text-gray-500 text-xs mb-1">
            (Nhấn để xem bảng giá)
          </Text>
          <StadiumSports sports={sports} />
        </View>

        {/* Ratings & Reviews */}
        <View className="h-px bg-gray-200 my-3" />
        <View className="px-4 pt-2">
          <StadiumRatings rating={4.8} />
          <StadiumReviews reviews={reviews} />
        </View>

        {/* Contact */}
        <View className="h-px bg-gray-200 my-3" />
        <View className="px-4 pt-2">
          <Text className="font-bold text-base text-gray-900">Liên hệ</Text>
          <StadiumContact phone="0123456789" email="abc@gmail.com" />
        </View>
      </ScrollView>
      {/* Fixed bottom button */}
      <View className="absolute left-0 right-0 bottom-0 bg-white p-4 rounded-t-2xl shadow-lg">
        <AppButton
          title="Đặt lịch"
          onPress={() => {
            router.push("/stadium-booking/booking-detail");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export const options = {
  headerShown: false,
};
